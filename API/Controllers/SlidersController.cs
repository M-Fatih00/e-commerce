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
            .Select(s => new ListSliderDTO { Id = s.Id, Index = s.Index, Resim = s.Resim, Aktif = s.Aktif })
            .ToListAsync();

        return Ok(sliders);
    }

    [HttpGet("all-sliders")]
    public async Task<IActionResult> GetSlidersAdmin()
    {
        var sliders = await _context.Sliders
            .AsNoTracking()
            .OrderBy(s => s.Index)
            .Select(s => new ListSliderDTO { Id = s.Id, Index = s.Index, Resim = s.Resim, Aktif = s.Aktif })
            .ToListAsync();

        return Ok(sliders);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetSlider(int id)
    {
        var slider = await _context.Sliders
            .AsNoTracking()
            .Where(s => s.Id == id)
            .Select(s => new ListSliderDTO { Id = s.Id, Index = s.Index, Resim = s.Resim, Aktif = s.Aktif })
            .FirstOrDefaultAsync();

        if (slider == null)
            return NotFound(new { message = "Slider bulunamadı." });

        return Ok(slider);
    }

    [HttpPost]
    [DemoDisabled]
    [RequestSizeLimit(UploadRequestLimit)]
    [RequestFormLimits(MultipartBodyLengthLimit = UploadRequestLimit)]
    public async Task<IActionResult> CreateSlider([FromForm] CreateSliderDTO dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (await _context.Sliders.CountAsync() >= MaxSliders)
            return BadRequest(new { message = $"En fazla {MaxSliders} slider eklenebilir." });

        var (extension, imageError) = await ImageValidator.ValidateAsync(dto.Resim);
        if (imageError != null)
            return BadRequest(new { message = imageError });

        var slider = new Slider
        {
            Index = dto.Index,
            Aktif = dto.Aktif,
            Resim = await _storage.SaveAsync(dto.Resim!, extension!, Folder)
        };

        _context.Sliders.Add(slider);
        await _context.SaveChangesAsync();

        return Ok(new ListSliderDTO { Id = slider.Id, Index = slider.Index, Resim = slider.Resim, Aktif = slider.Aktif });
    }

    [HttpPut("{id}")]
    [DemoDisabled]
    [RequestSizeLimit(UploadRequestLimit)]
    [RequestFormLimits(MultipartBodyLengthLimit = UploadRequestLimit)]
    public async Task<IActionResult> UpdateSlider(int id, [FromForm] UpdateSliderDTO dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

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

        slider.Index = dto.Index;
        slider.Aktif = dto.Aktif;

        await _context.SaveChangesAsync();
        _storage.DeleteIfUpload(oldImage);

        return Ok(new ListSliderDTO { Id = slider.Id, Index = slider.Index, Resim = slider.Resim, Aktif = slider.Aktif });
    }

    [HttpDelete("{id}")]
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
}