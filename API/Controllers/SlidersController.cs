using API.Data;
using API.DTO;
using API.Entity;
using API.Filters;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class SlidersController : ControllerBase
{
    private const int MaxSliders = 10;
    private const string Folder = "slider";
    private const long UploadRequestLimit = ImageValidator.MaxSize + 1024 * 1024;

    private readonly DataContext _context;
    private readonly UploadStorage _storage;

    public SlidersController(DataContext context, UploadStorage storage)
    {
        _context = context;
        _storage = storage;
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetSlidersToUI()
    {
        var sliders = await _context.Sliders
            .AsNoTracking()
            .Where(s => s.Aktif)
            .OrderBy(s => s.Index)
            .ThenBy(s => s.Id)
            .ToListAsync();

        return Ok(sliders.Select(ToDto));
    }

    [HttpGet("all-sliders")]
    public async Task<IActionResult> GetSlidersAdmin()
    {
        var sliders = await _context.Sliders
            .AsNoTracking()
            .OrderBy(s => s.Index)
            .ThenBy(s => s.Id)
            .ToListAsync();

        return Ok(sliders.Select(ToDto));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetSlider(int id)
    {
        var slider = await _context.Sliders.AsNoTracking().FirstOrDefaultAsync(s => s.Id == id);

        if (slider == null)
            return NotFound(new { message = "Slider bulunamadı." });

        return Ok(ToDto(slider));
    }

    [HttpPost]
    [DemoDisabled]
    [RequestSizeLimit(UploadRequestLimit)]
    [RequestFormLimits(MultipartBodyLengthLimit = UploadRequestLimit)]
    public async Task<IActionResult> CreateSlider([FromForm] CreateSliderDTO dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var textError = ValidateButton(dto.ButonMetni, dto.ButonLinki);
        if (textError != null)
            return BadRequest(new { message = textError });

        if (await _context.Sliders.CountAsync() >= MaxSliders)
            return BadRequest(new { message = $"En fazla {MaxSliders} slider eklenebilir." });

        var (extension, imageError) = await ImageValidator.ValidateAsync(dto.Resim);
        if (imageError != null)
            return BadRequest(new { message = imageError });

        var nextIndex = await _context.Sliders.AnyAsync()
            ? await _context.Sliders.MaxAsync(s => s.Index) + 1
            : 0;

        var slider = new Slider
        {
            Index = nextIndex,
            Aktif = dto.Aktif,
            Resim = await _storage.SaveAsync(dto.Resim!, extension!, Folder),
            Baslik = Clean(dto.Baslik),
            AltBaslik = Clean(dto.AltBaslik),
            ButonMetni = Clean(dto.ButonMetni),
            ButonLinki = Clean(dto.ButonLinki)
        };

        _context.Sliders.Add(slider);
        await _context.SaveChangesAsync();

        return Ok(ToDto(slider));
    }

    [HttpPut("{id:int}")]
    [DemoDisabled]
    [RequestSizeLimit(UploadRequestLimit)]
    [RequestFormLimits(MultipartBodyLengthLimit = UploadRequestLimit)]
    public async Task<IActionResult> UpdateSlider(int id, [FromForm] UpdateSliderDTO dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var textError = ValidateButton(dto.ButonMetni, dto.ButonLinki);
        if (textError != null)
            return BadRequest(new { message = textError });

        var slider = await _context.Sliders.FindAsync(id);
        if (slider == null)
            return NotFound(new { message = "Slider bulunamadı." });

        string? oldImage = null;
        if (dto.Resim != null)
        {
            var (extension, imageError) = await ImageValidator.ValidateAsync(dto.Resim);
            if (imageError != null)
                return BadRequest(new { message = imageError });

            oldImage = slider.Resim;
            slider.Resim = await _storage.SaveAsync(dto.Resim, extension!, Folder);
        }

        slider.Aktif = dto.Aktif;
        slider.Baslik = Clean(dto.Baslik);
        slider.AltBaslik = Clean(dto.AltBaslik);
        slider.ButonMetni = Clean(dto.ButonMetni);
        slider.ButonLinki = Clean(dto.ButonLinki);

        await _context.SaveChangesAsync();
        _storage.DeleteIfUpload(oldImage);

        return Ok(ToDto(slider));
    }

    [HttpPut("{id:int}/status")]
    [DemoDisabled]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] bool aktif)
    {
        var slider = await _context.Sliders.FindAsync(id);
        if (slider == null)
            return NotFound(new { message = "Slider bulunamadı." });

        slider.Aktif = aktif;
        await _context.SaveChangesAsync();

        return Ok(ToDto(slider));
    }

    [HttpPut("{id:int}/move")]
    [DemoDisabled]
    public async Task<IActionResult> Move(int id, [FromQuery] string direction)
    {
        if (direction != "up" && direction != "down")
            return BadRequest(new { message = "Geçersiz yön." });

        var sliders = await _context.Sliders
            .OrderBy(s => s.Index)
            .ThenBy(s => s.Id)
            .ToListAsync();

        var position = sliders.FindIndex(s => s.Id == id);
        if (position < 0)
            return NotFound(new { message = "Slider bulunamadı." });

        var target = direction == "up" ? position - 1 : position + 1;
        if (target >= 0 && target < sliders.Count)
            (sliders[position], sliders[target]) = (sliders[target], sliders[position]);

        for (var i = 0; i < sliders.Count; i++)
            sliders[i].Index = i;

        await _context.SaveChangesAsync();

        return Ok(sliders.Select(ToDto));
    }

    [HttpDelete("{id:int}")]
    [DemoDisabled]
    public async Task<IActionResult> DeleteSlider(int id)
    {
        var slider = await _context.Sliders.FindAsync(id);
        if (slider == null)
            return NotFound(new { message = "Slider bulunamadı." });

        var image = slider.Resim;

        _context.Sliders.Remove(slider);
        await _context.SaveChangesAsync();

        _storage.DeleteIfUpload(image);

        return Ok(new { message = "Slider silindi." });
    }

    private static string? Clean(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static string? ValidateButton(string? text, string? link) =>
        string.IsNullOrWhiteSpace(text) != string.IsNullOrWhiteSpace(link)
            ? "Buton yazısı ve buton linki birlikte girilmelidir."
            : null;

    private static ListSliderDTO ToDto(Slider s) => new()
    {
        Id = s.Id,
        Index = s.Index,
        Resim = s.Resim,
        Aktif = s.Aktif,
        Baslik = s.Baslik,
        AltBaslik = s.AltBaslik,
        ButonMetni = s.ButonMetni,
        ButonLinki = s.ButonLinki
    };
}