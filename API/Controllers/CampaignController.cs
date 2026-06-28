using API.Data;
using API.DTO;
using API.Entity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CampaignController : ControllerBase
{
    private readonly DataContext _context;
    public CampaignController(DataContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetCampaigns()
    {
        var campaigns = await _context.Campaigns
                    .OrderBy(c => c.Index)
                    .Select(c => new ListCampaignDTO
                    {
                        Id = c.Id,
                        ImageUrl = c.ImageUrl,
                        Index = c.Index,
                        CategoryId = c.CategoryId,
                        Title = c.Title,
                        Description = c.Description
                    })
                    .ToListAsync();

        return Ok(campaigns);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetCampaign(int id)
    {
        var campaign = await _context.Campaigns
            .Where(c => c.Id == id)
            .Select(c => new ListCampaignDTO
            {
                Id = c.Id,
                ImageUrl = c.ImageUrl,
                Index = c.Index,
                CategoryId = c.CategoryId,
                Title = c.Title,
                Description = c.Description
            })
            .FirstOrDefaultAsync(x => x.Id == id);

        if (campaign == null)
            return NotFound(new { Message = "Kampanya bulunamadı." });

        return Ok(campaign);
    }

    [HttpPost]
    public async Task<IActionResult> CreateCampaign([FromForm] CreateCampaignDTO dto)
    {
        var count = await _context.Campaigns.CountAsync();
        if (count >= 4)
            return BadRequest(new { message = "Maksimum 4 kampanya ekleyebilirsiniz." });
            
        if (dto.Resim == null || dto.Resim.Length == 0)
            return BadRequest("Resim seçilmedi");

        var fileName = Guid.NewGuid().ToString() + Path.GetExtension(dto.Resim.FileName);
        var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/img/campaigns", fileName);

        using (var stream = new FileStream(path, FileMode.Create))
        {
            await dto.Resim.CopyToAsync(stream);
        }

        var campaign = new Campaign
        {
            Title = dto.Title,
            Description = dto.Description,
            CategoryId = dto.CategoryId,
            Index = dto.Index,
            ImageUrl = "campaigns/" + fileName
        };

        _context.Campaigns.Add(campaign);
        await _context.SaveChangesAsync();

        return Ok(CampaignToDTO(campaign));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCampaign(int id, [FromForm] UpdateCampaignDTO dto)
    {
        if (id != dto.Id) return BadRequest("ID eşleşmiyor.");

        var campaign = await _context.Campaigns.FindAsync(id);
        if (campaign == null) return NotFound("Güncellenmek istenen kampanya bulunamadı.");

        campaign.Title = dto.Title;
        campaign.Description = dto.Description;
        campaign.CategoryId = dto.CategoryId;
        campaign.Index = dto.Index;

        if (dto.Resim != null && dto.Resim.Length > 0)
        {
            // Eski resmi sil
            var oldFilePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/img", campaign.ImageUrl);
            if (System.IO.File.Exists(oldFilePath))
                System.IO.File.Delete(oldFilePath);

            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(dto.Resim.FileName);
            var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/img/campaigns");

            if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);

            var newPath = Path.Combine(folderPath, fileName);
            using (var stream = new FileStream(newPath, FileMode.Create))
            {
                await dto.Resim.CopyToAsync(stream);
            }

            campaign.ImageUrl = "campaigns/" + fileName;
        }

        try
        {
            _context.Campaigns.Update(campaign);
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            return BadRequest("Güncelleme sırasında bir hata oluştu: " + ex.Message);
        }

        return Ok(CampaignToDTO(campaign));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCampaign(int id)
    {
        var campaign = await _context.Campaigns.FindAsync(id);
        if (campaign == null)
            return NotFound(new { Message = "Silinmek istenen kampanya bulunamadı." });

        var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/img", campaign.ImageUrl);
        if (System.IO.File.Exists(filePath))
        {
            try { System.IO.File.Delete(filePath); }
            catch (Exception ex) { Console.WriteLine("Dosya silinemedi: " + ex.Message); }
        }

        _context.Campaigns.Remove(campaign);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Kampanya ve bağlı görsel başarıyla silindi." });
    }

    private static ListCampaignDTO CampaignToDTO(Campaign c)
    {
        var dto = new ListCampaignDTO();
        if (c != null)
        {
            dto.Id = c.Id;
            dto.ImageUrl = c.ImageUrl;
            dto.Index = c.Index;
            dto.CategoryId = c.CategoryId;
            dto.Title = c.Title;
            dto.Description = c.Description;
        }
        return dto;
    }
}