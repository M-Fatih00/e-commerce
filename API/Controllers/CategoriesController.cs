using API.Data;
using API.DTO;
using API.Entity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly DataContext _context;
    public CategoriesController(DataContext context)
    {
        _context = context;
    }


    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetCategories()
    {
        var Categoryes = await _context.Categories
            .Select(x => new CategoryDTO
            {
                Id = x.Id,
                Name = x.Name,
                ImageUrl = x.ImageUrl,
                ProductCount = x.Products.Count
            }).ToListAsync();

        return Ok(Categoryes);
    }


    [HttpGet("{id}")]
    public async Task<IActionResult> GetCategory(int id)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(i => i.Id == id);

        if (category == null)
            return NotFound();

        var productCount = await _context.Products
            .CountAsync(p => p.CategoryId == id);

        return Ok(new CategoryDTO
        {
            Id = category.Id,
            Name = category.Name,
            ImageUrl = category.ImageUrl,
            ProductCount = productCount
        });
    }

    [HttpGet("{id}/products")]
    public async Task<IActionResult> GetProductsByCategory(int id)
    {
        var category = await _context.Categories.AnyAsync(c => c.Id == id);
        if (!category) return NotFound("Kategori Bulunamadı.");

        var products = await _context.Products
                            .Where(p => p.CategoryId == id)
                            .Include(p => p.Images)
                            .Select(p => new ProductListDTO
                            {
                                Id = p.Id,
                                Name = p.Name,
                                NewPrice = p.NewPrice,
                                Discount = p.Discount,

                                MainImage = p.Images
                                .Where(x => x.IsMain)
                                .Select(x => x.Url)
                                .FirstOrDefault() ?? "",

                                HoverImage = p.Images
                                .Where(x => !x.IsMain)
                                .Select(x => x.Url)
                                .FirstOrDefault()
                                ?? p.Images
                                    .Where(x => x.IsMain)
                                    .Select(x => x.Url)
                                    .FirstOrDefault()
                                ?? ""
                            }).ToListAsync();

        return Ok(products);
    }


    // resmi kaydeden metot
    private async Task<string> SaveCategoryImage(IFormFile file)
    {
        var fileName = Guid.NewGuid() + Path.GetExtension(file.FileName);

        var folderPath = Path.Combine(
            Directory.GetCurrentDirectory(),
            "wwwroot/img/categories"
        );

        // klasör yoksa oluştur
        if (!Directory.Exists(folderPath))
        {
            Directory.CreateDirectory(folderPath);
        }

        var filePath = Path.Combine(folderPath, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // DB’ye kaydedilecek URL
        return "categories/" + fileName;
    }

    [HttpPost]
    public async Task<IActionResult> CreateCategory([FromForm] CreateCategoryDTO dto)
    {
        var category = new Category
        {
            Name = dto.Name
        };

        if (dto.Image != null)
        {
            var imageUrl = await SaveCategoryImage(dto.Image);
            category.ImageUrl = imageUrl;
        }

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return Ok(new CategoryDTO
        {
            Id = category.Id,
            Name = category.Name,
            ImageUrl = category.ImageUrl,
            ProductCount = 0
        });
    }


    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategory(int id, [FromForm] UpdateCategoryDTO dto)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(x => x.Id == id);

        if (category == null)
            return NotFound();

        // sadece geleni güncelle
        if (!string.IsNullOrEmpty(dto.Name))
            category.Name = dto.Name;

        if (dto.Image != null)
            category.ImageUrl = await SaveCategoryImage(dto.Image);

        await _context.SaveChangesAsync();

        return Ok(new CategoryDTO
        {
            Id = category.Id,
            Name = category.Name,
            ImageUrl = category.ImageUrl,
            ProductCount = category.Products?.Count ?? 0
        });
    }


    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(x => x.Id == id);

        if (category == null)
            return NotFound();

        _context.Categories.Remove(category);

        await _context.SaveChangesAsync();

        return Ok("Category deleted permanently");
    }

}