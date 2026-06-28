using API.Data;
using API.DTO;
using API.Entity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SlidersController : ControllerBase
{
    private readonly DataContext _context;
    public SlidersController(DataContext context)
    {
        _context = context;
    }


    [HttpGet("all-sliders")]
    public async Task<IActionResult> GetSlidersAdmin()
    {
        var sliders = await _context.Sliders
        .OrderBy(i => i.Index)
        .Select(s => SliderToDTO(s)).ToListAsync();

        return Ok(sliders);
    }

    [HttpGet]
    public async Task<IActionResult> GetSlidersToUI()
    {
        var sliders = await _context.Sliders
        .Where(i => i.Aktif)
        .OrderBy(i => i.Index)
        .Select(s => SliderToDTO(s)).ToListAsync();

        return Ok(sliders);
    }


    [HttpGet("{id}")]
    public async Task<IActionResult> GetSlider(int? id)
    {
        if (id == null)
            return NotFound();

        var slider = await _context.Sliders
                .Where(s => s.Id == id)
                .Select(s => SliderToDTO(s))
                .FirstOrDefaultAsync();

        if (slider == null)
            return NotFound();

        return Ok(slider);
    }


    [HttpPost]
    public async Task<IActionResult> CeateSlider([FromForm] CreateSliderDTO dto)
    {

        var fileName = Guid.NewGuid().ToString() + Path.GetExtension(dto.Resim.FileName);

        var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/img/", fileName);

        using (var stream = new FileStream(path, FileMode.Create))
        {
            await dto.Resim.CopyToAsync(stream);
        }

        var slider = new Slider
        {
            Index = dto.Index,
            Aktif = dto.Aktif,
            Resim = fileName
        };

        _context.Sliders.Add(slider);
        await _context.SaveChangesAsync();

        return Ok(slider);
    }


    [HttpPut]
    public async Task<IActionResult> UpdateSlider(int id, [FromForm] UpdateSliderDTO dto)
    {
        if (id != dto.Id) return NotFound("ID Eşleşmmiyor");

        var slider = await _context.Sliders.FindAsync(id);
        if (slider == null) return NotFound();

        slider.Index = dto.Index;
        slider.Aktif = dto.Aktif;

        if (dto.Resim != null && dto.Resim.Length > 0)
        {
            var oldPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/img/", slider.Resim);
            if (System.IO.File.Exists(oldPath))
            {
                System.IO.File.Delete(oldPath);
            }

            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(dto.Resim.FileName);
            var newPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/img/", fileName);

            using (var stream = new FileStream(newPath, FileMode.Create))
            {
                await dto.Resim.CopyToAsync(stream);
            }

            slider.Resim = fileName;
        }

        _context.Sliders.Update(slider);
        await _context.SaveChangesAsync();

        return Ok(slider);
    }


    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSlider(int id)
    {
        var slider = await _context.Sliders.FindAsync(id);

        if (slider == null)
        {
            return NotFound(new { Message = "Silinmek istenen slider bulunamadı." });
        }

        if (!string.IsNullOrEmpty(slider.Resim))
        {
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/img/", slider.Resim);

            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }
        }

        _context.Sliders.Remove(slider);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Slider başarıyla silindi." });
    }



    private static ListSliderDTO SliderToDTO(Slider s)
    {
        var dto = new ListSliderDTO();

        if (s != null)
        {
            dto.Id = s.Id;
            dto.Resim = s.Resim;
            dto.Index = s.Index;
            dto.Aktif = s.Aktif;
        }

        return dto;
    }

}