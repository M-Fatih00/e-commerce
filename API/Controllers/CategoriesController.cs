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
public class CategoriesController : ControllerBase
{
    private const string Folder = "categories";
    private const long UploadRequestLimit = ImageValidator.MaxSize + 1024 * 1024;

    private readonly DataContext _context;
    private readonly UploadStorage _storage;

    public CategoriesController(DataContext context, UploadStorage storage)
    {
        _context = context;
        _storage = storage;
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _context.Categories
            .AsNoTracking()
            .OrderBy(c => c.Id)
            .Select(c => new CategoryDTO
            {
                Id = c.Id,
                Name = c.Name,
                ImageUrl = c.ImageUrl,
                ProductCount = c.Products.Count
            })
            .ToListAsync();

        return Ok(categories);
    }

    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetCategory(int id)
    {
        var category = await _context.Categories
            .AsNoTracking()
            .Where(c => c.Id == id)
            .Select(c => new CategoryDTO
            {
                Id = c.Id,
                Name = c.Name,
                ImageUrl = c.ImageUrl,
                ProductCount = c.Products.Count
            })
            .FirstOrDefaultAsync();

        if (category == null)
            return NotFound(new { message = "Kategori bulunamadı." });

        return Ok(category);
    }

    [AllowAnonymous]
    [HttpGet("{id}/products")]
    public async Task<IActionResult> GetProductsByCategory(int id)
    {
        if (!await _context.Categories.AnyAsync(c => c.Id == id))
            return NotFound(new { message = "Kategori bulunamadı." });

        var products = await _context.Products
            .AsNoTracking()
            .Where(p => p.CategoryId == id)
            .OrderBy(p => p.Id)
            .Select(p => new
            {
                p.Id,
                p.Name,
                p.OldPrice,
                p.NewPrice,
                p.CategoryId,
                MainImage = p.Images.Where(i => i.IsMain).Select(i => i.Url).FirstOrDefault(),
                HoverImage = p.Images.Where(i => !i.IsMain).Select(i => i.Url).FirstOrDefault(),
                AverageRating = p.ProductReviews!.Select(r => (double?)r.Rating).Average() ?? 0
            })
            .ToListAsync();

        return Ok(products.Select(p => new ProductListDTO
        {
            Id = p.Id,
            Name = p.Name,
            OldPrice = p.OldPrice,
            NewPrice = p.NewPrice,
            Discount = Product.CalculateDiscount(p.OldPrice, p.NewPrice),
            MainImage = p.MainImage ?? "",
            HoverImage = p.HoverImage ?? p.MainImage ?? "",
            CategoryId = p.CategoryId,
            AverageRating = p.AverageRating
        }));
    }

    [HttpPost]
    [DemoDisabled]
    [RequestSizeLimit(UploadRequestLimit)]
    [RequestFormLimits(MultipartBodyLengthLimit = UploadRequestLimit)]
    public async Task<IActionResult> CreateCategory([FromForm] CreateCategoryDTO dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var name = dto.Name.Trim();
        if (name.Length == 0)
            return BadRequest(new { message = "Kategori adı zorunludur." });

        if (await NameExists(name, null))
            return BadRequest(new { message = "Bu isimde bir kategori zaten var." });

        var category = new Category { Name = name };

        if (dto.Image != null)
        {
            var (extension, imageError) = await ImageValidator.ValidateAsync(dto.Image);
            if (imageError != null)
                return BadRequest(new { message = imageError });

            category.ImageUrl = await _storage.SaveAsync(dto.Image, extension!, Folder);
        }

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return Ok(new CategoryDTO { Id = category.Id, Name = category.Name, ImageUrl = category.ImageUrl, ProductCount = 0 });
    }

    [HttpPut("{id}")]
    [DemoDisabled]
    [RequestSizeLimit(UploadRequestLimit)]
    [RequestFormLimits(MultipartBodyLengthLimit = UploadRequestLimit)]
    public async Task<IActionResult> UpdateCategory(int id, [FromForm] UpdateCategoryDTO dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var category = await _context.Categories.FindAsync(id);
        if (category == null)
            return NotFound(new { message = "Kategori bulunamadı." });

        if (!string.IsNullOrWhiteSpace(dto.Name))
        {
            var name = dto.Name.Trim();
            if (await NameExists(name, id))
                return BadRequest(new { message = "Bu isimde bir kategori zaten var." });

            category.Name = name;
        }

        string? oldImage = null;
        if (dto.Image != null)
        {
            var (extension, imageError) = await ImageValidator.ValidateAsync(dto.Image);
            if (imageError != null)
                return BadRequest(new { message = imageError });

            oldImage = category.ImageUrl;
            category.ImageUrl = await _storage.SaveAsync(dto.Image, extension!, Folder);
        }

        await _context.SaveChangesAsync();
        _storage.DeleteIfUpload(oldImage);

        var productCount = await _context.Products.CountAsync(p => p.CategoryId == id);

        return Ok(new CategoryDTO { Id = category.Id, Name = category.Name, ImageUrl = category.ImageUrl, ProductCount = productCount });
    }

    [HttpDelete("{id}")]
    [DemoDisabled]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null)
            return NotFound(new { message = "Kategori bulunamadı." });

        var productCount = await _context.Products.CountAsync(p => p.CategoryId == id);
        if (productCount > 0)
            return BadRequest(new { message = $"Bu kategoride {productCount} ürün var. Önce ürünleri başka bir kategoriye taşıyın." });

        if (await _context.Campaigns.AnyAsync(c => c.CategoryId == id))
            return BadRequest(new { message = "Bu kategori bir kampanyada kullanılıyor. Önce kampanyayı güncelleyin." });

        var image = category.ImageUrl;

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        _storage.DeleteIfUpload(image);

        return Ok(new { message = "Kategori silindi." });
    }

    private Task<bool> NameExists(string name, int? exceptId)
    {
        var lowered = name.ToLower();
        return _context.Categories.AnyAsync(c => c.Name.ToLower() == lowered && c.Id != exceptId);
    }
}