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
public class ProductsController : ControllerBase
{
    private readonly DataContext _context;

    public ProductsController(DataContext context)
    {
        _context = context;
    }


    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetProducts([FromQuery] string? search)
    {
        var query = _context.Products.Include(p => p.Images).Include(p => p.ProductReviews).AsQueryable();

        if (!string.IsNullOrEmpty(search))
            query = query.Where(p => p.Name.ToLower().Contains(search.ToLower()));

        var products = await query.ToListAsync();

        var result = products.Select(p => new ProductListDTO
        {
            Id = p.Id,
            Name = p.Name,
            NewPrice = p.NewPrice,
            Discount = p.Discount,
            MainImage = p.Images.FirstOrDefault(x => x.IsMain)?.Url ?? "",
            HoverImage = p.Images.FirstOrDefault(x => !x.IsMain)?.Url
                ?? p.Images.FirstOrDefault(x => x.IsMain)?.Url
                ?? "",
            CategoryId = p.CategoryId,
            AverageRating = p.ProductReviews != null && p.ProductReviews.Any()
                ? p.ProductReviews.Average(r => r.Rating)
                : 0
        }).ToList();

        return Ok(result);
    }


    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetProduct(int id)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.Colors)
            .Include(p => p.Sizes)
            .Include(p => p.ProductReviews)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
            return NotFound();

        var result = new ProductDetailDTO
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            OldPrice = product.OldPrice,
            NewPrice = product.NewPrice,
            Discount = product.Discount,

            ReviewCount = product.ProductReviews?.Count ?? 0,
            AverageRating = product.ProductReviews != null && product.ProductReviews.Any()
            ? product.ProductReviews.Average(r => r.Rating)
            : 0,

            CategoryName = product.Category.Name,

            // ALL IMAGES
            Images = product.Images
                .Select(x => x.Url)
                .ToList(),

            // COLORS
            Colors = product.Colors?
                .Select(x => x.Color)
                .ToList(),

            // SIZES
            Sizes = product.Sizes?
                .Select(x => new ProductSizeDTO
                {
                    Size = x.Size.ToString(),
                    Stock = x.Stock
                }).ToList()
        };

        return Ok(result);
    }


    [HttpPost]
    public async Task<IActionResult> CreateProduct([FromForm] CreateProductDTO dto)
    {
        if (dto.Images == null || dto.Images.Count == 0)
            return BadRequest("En az 1 resim zorunludur.");

        var product = new Product
        {
            Name = dto.Name,
            Description = dto.Description,
            OldPrice = dto.OldPrice,
            NewPrice = dto.NewPrice,
            Discount = dto.Discount,
            CategoryId = dto.CategoryId
        };

        var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/img/products");

        if (!Directory.Exists(uploadPath))
            Directory.CreateDirectory(uploadPath);

        for (int i = 0; i < dto.Images.Count; i++)
        {
            var file = dto.Images[i];

            var imageError = ValidateImage(file);
            if (imageError != null) return BadRequest(imageError);

            var fileName = Guid.NewGuid() + Path.GetExtension(file.FileName);
            var filePath = Path.Combine(uploadPath, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            product.Images.Add(new ProductImage
            {
                Url = $"products/{fileName}",
                IsMain = i == 0
            });
        }

        // colors
        if (dto.Colors != null && dto.Colors.Count > 0)
        {
            foreach (var color in dto.Colors)
            {
                if (!IsValidHex(color))
                    return BadRequest($"Geçersiz renk: {color}");

                product.Colors.Add(new ProductColor { Color = color });
            }
        }

        // sizes
        if (dto.Sizes != null && dto.Sizes.Count > 0)
        {
            foreach (var size in dto.Sizes)
            {
                if (!Enum.TryParse<ProductSizeType>(size, true, out var parsed))
                    return BadRequest($"Geçersiz beden: {size}");

                product.Sizes.Add(new ProductSize { Size = parsed });
            }
        }

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Ürün oluşturuldu",
            productId = product.Id
        });
    }


    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(int id, [FromForm] UpdateProductDTO dto)
    {
        var product = await _context.Products
            .Include(p => p.Images)
            .Include(p => p.Colors)
            .Include(p => p.Sizes)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
            return NotFound();

        if (!string.IsNullOrEmpty(dto.Name))
            product.Name = dto.Name;

        if (dto.OldPrice.HasValue)
            product.OldPrice = dto.OldPrice.Value;

        if (dto.NewPrice.HasValue)
            product.NewPrice = dto.NewPrice.Value;

        if (dto.Discount.HasValue)
            product.Discount = dto.Discount.Value;

        if (dto.CategoryId.HasValue)
            product.CategoryId = dto.CategoryId.Value;

        if (!string.IsNullOrEmpty(dto.Description))
            product.Description = dto.Description;

        // image

        if (dto.NewImages != null && dto.NewImages.Count > 0)
        {
            var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/img/products");

            if (!Directory.Exists(uploadPath))
                Directory.CreateDirectory(uploadPath);

            foreach (var file in dto.NewImages)
            {
                var imageError = ValidateImage(file);
                if (imageError != null) return BadRequest(imageError);

                var fileName = Guid.NewGuid() + Path.GetExtension(file.FileName);
                var filePath = Path.Combine(uploadPath, fileName);

                using var stream = new FileStream(filePath, FileMode.Create);
                await file.CopyToAsync(stream);

                product.Images.Add(new ProductImage
                {
                    Url = $"products/{fileName}",
                    IsMain = false
                });
            }
        }


        // colors

        if (dto.Colors != null && dto.Colors.Count > 0)
        {
            product.Colors.Clear();
            foreach (var color in dto.Colors)
            {
                if (!IsValidHex(color))
                    return BadRequest($"Geçersiz renk: {color}");
                product.Colors.Add(new ProductColor { Color = color });
            }
        }


        // sizes
        if (dto.Sizes != null && dto.Sizes.Count > 0)
        {
            product.Sizes.Clear();
            for (int i = 0; i < dto.Sizes.Count; i++)
            {
                if (!Enum.TryParse<ProductSizeType>(dto.Sizes[i], true, out var parsed))
                    return BadRequest($"Geçersiz beden: {dto.Sizes[i]}");

                product.Sizes.Add(new ProductSize
                {
                    Size = parsed,
                    Stock = dto.Stocks != null && i < dto.Stocks.Count ? dto.Stocks[i] : 0
                });
            }
        }

        await _context.SaveChangesAsync();

        return Ok("Ürün güncellendi");
    }


    private static readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
    private const long _maxFileSize = 5 * 1024 * 1024; // 5 MB

    private string? ValidateImage(IFormFile file)
    {
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!_allowedExtensions.Contains(ext))
            return $"Geçersiz dosya türü: {ext}. Sadece resim yükleyebilirsiniz (jpg, png, webp, gif).";

        if (file.Length > _maxFileSize)
            return "Dosya boyutu 5 MB'tan büyük olamaz.";

        if (file.Length == 0)
            return "Boş dosya yüklenemez.";

        return null; // sorun yok
    }

    private bool IsValidHex(string color)
    {
        return System.Text.RegularExpressions.Regex
            .IsMatch(color, "^#([0-9A-Fa-f]{6})$");
    }



    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _context.Products
            .Include(x => x.Images)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (product == null)
            return NotFound();

        // ilişkili veriler cascade ise otomatik silinir
        _context.Products.Remove(product);

        await _context.SaveChangesAsync();

        return Ok("Product deleted permanently");
    }

}