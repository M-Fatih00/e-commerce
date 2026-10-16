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
public class CampaignController : ControllerBase
{
    private const int MaxCampaigns = 4;
    private const string Folder = "campaigns";
    private const long UploadRequestLimit = ImageValidator.MaxSize + 1024 * 1024;

    private readonly DataContext _context;
    private readonly UploadStorage _storage;

    public CampaignController(DataContext context, UploadStorage storage)
    {
        _context = context;
        _storage = storage;
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetCampaigns()
    {
        var campaigns = await _context.Campaigns
            .AsNoTracking()
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

    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetCampaign(int id)
    {
        var campaign = await _context.Campaigns.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id);
        if (campaign == null)
            return NotFound(new { message = "Kampanya bulunamadı." });

        return Ok(ToDTO(campaign));
    }

    [HttpPost]
    [DemoDisabled]
    [RequestSizeLimit(UploadRequestLimit)]
    [RequestFormLimits(MultipartBodyLengthLimit = UploadRequestLimit)]
    public async Task<IActionResult> CreateCampaign([FromForm] CreateCampaignDTO dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (await _context.Campaigns.CountAsync() >= MaxCampaigns)
            return BadRequest(new { message = $"En fazla {MaxCampaigns} kampanya eklenebilir." });

        if (!await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId))
            return BadRequest(new { message = "Kategori bulunamadı." });

        var (extension, imageError) = await ImageValidator.ValidateAsync(dto.Resim);
        if (imageError != null)
            return BadRequest(new { message = imageError });

        var campaign = new Campaign
        {
            Title = dto.Title.Trim(),
            Description = dto.Description?.Trim(),
            CategoryId = dto.CategoryId,
            Index = dto.Index,
            ImageUrl = await _storage.SaveAsync(dto.Resim!, extension!, Folder)
        };

        _context.Campaigns.Add(campaign);
        await _context.SaveChangesAsync();

        return Ok(ToDTO(campaign));
    }

    [HttpPut("{id}")]
    [DemoDisabled]
    [RequestSizeLimit(UploadRequestLimit)]
    [RequestFormLimits(MultipartBodyLengthLimit = UploadRequestLimit)]
    public async Task<IActionResult> UpdateCampaign(int id, [FromForm] UpdateCampaignDTO dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var campaign = await _context.Campaigns.FindAsync(id);
        if (campaign == null)
            return NotFound(new { message = "Kampanya bulunamadı." });

        if (!await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId))
            return BadRequest(new { message = "Kategori bulunamadı." });

        string? oldImage = null;
        if (dto.Resim != null)
        {
            var (extension, imageError) = await ImageValidator.ValidateAsync(dto.Resim);
            if (imageError != null)
                return BadRequest(new { message = imageError });

            oldImage = campaign.ImageUrl;
            campaign.ImageUrl = await _storage.SaveAsync(dto.Resim, extension!, Folder);
        }

        campaign.Title = dto.Title.Trim();
        campaign.Description = dto.Description?.Trim();
        campaign.CategoryId = dto.CategoryId;
        campaign.Index = dto.Index;

        await _context.SaveChangesAsync();
        _storage.DeleteIfUpload(oldImage);

        return Ok(ToDTO(campaign));
    }

    [HttpDelete("{id}")]
    [DemoDisabled]
    public async Task<IActionResult> DeleteCampaign(int id)
    {
        var campaign = await _context.Campaigns.FindAsync(id);
        if (campaign == null)
            return NotFound(new { message = "Kampanya bulunamadı." });

        var image = campaign.ImageUrl;

        _context.Campaigns.Remove(campaign);
        await _context.SaveChangesAsync();

        _storage.DeleteIfUpload(image);

        return Ok(new { message = "Kampanya silindi." });
    }

    private static ListCampaignDTO ToDTO(Campaign c) => new()
    {
        Id = c.Id,
        ImageUrl = c.ImageUrl,
        Index = c.Index,
        CategoryId = c.CategoryId,
        Title = c.Title,
        Description = c.Description
    };
}