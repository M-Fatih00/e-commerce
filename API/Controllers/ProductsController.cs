using System.Text.RegularExpressions;
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
public class ProductsController : ControllerBase
{
    private const int MaxImages = 6;
    private const int MaxColors = 12;
    private const int MaxStock = 100_000;
    private const decimal MaxPrice = 1_000_000m;
    private const long UploadRequestLimit = MaxImages * ImageValidator.MaxSize + 1024 * 1024;

    private static readonly Regex HexColor = new("^#[0-9A-Fa-f]{6}$", RegexOptions.Compiled);

    private readonly DataContext _context;
    private readonly IWebHostEnvironment _env;

    public ProductsController(DataContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetProducts([FromQuery] string? search)
    {
        var query = _context.Products.AsNoTracking();

        var term = search?.Trim();
        if (!string.IsNullOrEmpty(term))
        {
            if (term.Length > 100) term = term[..100];
            var lowered = term.ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(lowered));
        }

        var products = await query
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

    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetProduct(int id)
    {
        var product = await _context.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.Colors)
            .Include(p => p.Sizes)
            .Include(p => p.ProductReviews)
            .AsSplitQuery()
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
            return NotFound(new { message = "Ürün bulunamadı." });

        var reviews = product.ProductReviews ?? new List<ProductReview>();

        return Ok(new ProductDetailDTO
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            OldPrice = product.OldPrice,
            NewPrice = product.NewPrice,
            Discount = Product.CalculateDiscount(product.OldPrice, product.NewPrice),
            ReviewCount = reviews.Count,
            AverageRating = reviews.Count > 0 ? reviews.Average(r => r.Rating) : 0,
            CategoryName = product.Category.Name,
            Images = product.Images.OrderByDescending(x => x.IsMain).ThenBy(x => x.Id).Select(x => x.Url).ToList(),
            Colors = product.Colors.Select(x => x.Color).ToList(),
            Sizes = product.Sizes
                .OrderBy(x => x.Size)
                .Select(x => new ProductSizeDTO { Size = x.Size.ToString(), Stock = x.Stock })
                .ToList()
        });
    }

    [HttpPost]
    [DemoDisabled]
    [RequestSizeLimit(UploadRequestLimit)]
    [RequestFormLimits(MultipartBodyLengthLimit = UploadRequestLimit)]
    public async Task<IActionResult> CreateProduct([FromForm] CreateProductDTO dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var name = dto.Name.Trim();

        var error = await ValidateProduct(name, dto.OldPrice, dto.NewPrice, dto.CategoryId);
        if (error != null) return BadRequest(new { message = error });

        if (dto.Images.Count == 0)
            return BadRequest(new { message = "En az 1 görsel zorunludur." });

        var (images, imageError) = await ValidateImages(dto.Images, 0);
        if (imageError != null) return BadRequest(new { message = imageError });

        var (colors, colorError) = ParseColors(dto.Colors);
        if (colorError != null) return BadRequest(new { message = colorError });

        var (sizes, sizeError) = ParseSizes(dto.Sizes, dto.Stocks);
        if (sizeError != null) return BadRequest(new { message = sizeError });

        var product = new Product
        {
            Name = name,
            Description = dto.Description?.Trim(),
            OldPrice = dto.OldPrice,
            NewPrice = dto.NewPrice,
            Discount = Product.CalculateDiscount(dto.OldPrice, dto.NewPrice),
            CategoryId = dto.CategoryId
        };

        for (var i = 0; i < images!.Count; i++)
        {
            var url = await SaveImage(images[i].File, images[i].Extension);
            product.Images.Add(new ProductImage { Url = url, IsMain = i == 0 });
        }

        foreach (var color in colors!)
            product.Colors.Add(new ProductColor { Color = color });

        product.Sizes.AddRange(sizes!);

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Ürün oluşturuldu.", productId = product.Id });
    }

    [HttpPut("{id}")]
    [DemoDisabled]
    [RequestSizeLimit(UploadRequestLimit)]
    [RequestFormLimits(MultipartBodyLengthLimit = UploadRequestLimit)]
    public async Task<IActionResult> UpdateProduct(int id, [FromForm] UpdateProductDTO dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var product = await _context.Products
            .Include(p => p.Images)
            .Include(p => p.Colors)
            .Include(p => p.Sizes)
            .AsSplitQuery()
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
            return NotFound(new { message = "Ürün bulunamadı." });

        var name = string.IsNullOrWhiteSpace(dto.Name) ? product.Name : dto.Name.Trim();
        var oldPrice = dto.OldPrice ?? product.OldPrice;
        var newPrice = dto.NewPrice ?? product.NewPrice;
        var categoryId = dto.CategoryId ?? product.CategoryId;

        var error = await ValidateProduct(name, oldPrice, newPrice, categoryId);
        if (error != null) return BadRequest(new { message = error });

        var (images, imageError) = await ValidateImages(dto.NewImages, product.Images.Count);
        if (imageError != null) return BadRequest(new { message = imageError });

        List<string>? colors = null;
        if (dto.Colors is { Count: > 0 })
        {
            (colors, var colorError) = ParseColors(dto.Colors);
            if (colorError != null) return BadRequest(new { message = colorError });
        }

        List<ProductSize>? sizes = null;
        if (dto.Sizes is { Count: > 0 })
        {
            (sizes, var sizeError) = ParseSizes(dto.Sizes, dto.Stocks);
            if (sizeError != null) return BadRequest(new { message = sizeError });
        }

        product.Name = name;
        if (dto.Description != null) product.Description = dto.Description.Trim();
        product.OldPrice = oldPrice;
        product.NewPrice = newPrice;
        product.Discount = Product.CalculateDiscount(oldPrice, newPrice);
        product.CategoryId = categoryId;

        foreach (var image in images!)
        {
            var url = await SaveImage(image.File, image.Extension);
            product.Images.Add(new ProductImage { Url = url, IsMain = product.Images.Count == 0 });
        }

        if (colors != null)
        {
            product.Colors.Clear();
            foreach (var color in colors)
                product.Colors.Add(new ProductColor { Color = color });
        }

        if (sizes != null)
        {
            product.Sizes.Clear();
            product.Sizes.AddRange(sizes);
        }

        await _context.SaveChangesAsync();

        return Ok(new { message = "Ürün güncellendi." });
    }

    [HttpDelete("{id}")]
    [DemoDisabled]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _context.Products
            .Include(x => x.Images)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (product == null)
            return NotFound(new { message = "Ürün bulunamadı." });

        if (await _context.OrderItems.AnyAsync(i => i.UrunId == id))
            return BadRequest(new { message = "Bu ürün geçmiş siparişlerde yer aldığı için silinemez." });

        var imageUrls = product.Images.Select(i => i.Url).ToList();

        var cartItems = await _context.CartItems.Where(c => c.UrunId == id).ToListAsync();
        _context.CartItems.RemoveRange(cartItems);
        _context.Products.Remove(product);
        await _context.SaveChangesAsync();

        await DeleteUnusedUploads(imageUrls);

        return Ok(new { message = "Ürün silindi." });
    }

    private async Task<string?> ValidateProduct(string name, decimal oldPrice, decimal newPrice, int categoryId)
    {
        if (string.IsNullOrWhiteSpace(name))
            return "Ürün adı zorunludur.";

        if (newPrice <= 0 || newPrice > MaxPrice)
            return "Satış fiyatı 0 ile 1.000.000 ₺ arasında olmalıdır.";

        if (oldPrice > MaxPrice)
            return "Liste fiyatı en fazla 1.000.000 ₺ olabilir.";

        if (oldPrice < newPrice)
            return "Liste fiyatı satış fiyatından düşük olamaz.";

        if (!await _context.Categories.AnyAsync(c => c.Id == categoryId))
            return "Kategori bulunamadı.";

        return null;
    }

    private static async Task<(List<(IFormFile File, string Extension)>? Images, string? Error)> ValidateImages(
        List<IFormFile>? files, int existingCount)
    {
        var list = files ?? new List<IFormFile>();

        if (existingCount + list.Count > MaxImages)
            return (null, $"Bir ürüne en fazla {MaxImages} görsel eklenebilir.");

        var result = new List<(IFormFile, string)>();
        foreach (var file in list)
        {
            var (extension, error) = await ImageValidator.ValidateAsync(file);
            if (error != null) return (null, error);
            result.Add((file, extension!));
        }

        return (result, null);
    }

    private static (List<string>? Colors, string? Error) ParseColors(List<string>? colors)
    {
        var result = (colors ?? new List<string>())
            .Select(c => c.Trim().ToUpperInvariant())
            .Distinct()
            .ToList();

        if (result.Count > MaxColors)
            return (null, $"En fazla {MaxColors} renk eklenebilir.");

        var invalid = result.FirstOrDefault(c => !HexColor.IsMatch(c));
        return invalid != null ? (null, $"Geçersiz renk: {invalid}") : (result, null);
    }

    private static (List<ProductSize>? Sizes, string? Error) ParseSizes(List<string>? sizes, List<int>? stocks)
    {
        var list = sizes ?? new List<string>();
        var result = new List<ProductSize>();

        for (var i = 0; i < list.Count; i++)
        {
            if (!Enum.TryParse<ProductSizeType>(list[i], true, out var parsed) || !Enum.IsDefined(parsed))
                return (null, $"Geçersiz beden: {list[i]}");

            if (result.Any(s => s.Size == parsed))
                return (null, $"Beden tekrar ediyor: {parsed}");

            var stock = stocks != null && i < stocks.Count ? stocks[i] : 0;
            if (stock < 0 || stock > MaxStock)
                return (null, $"Stok 0 ile {MaxStock} arasında olmalıdır.");

            result.Add(new ProductSize { Size = parsed, Stock = stock });
        }

        return (result, null);
    }

    private async Task<string> SaveImage(IFormFile file, string extension)
    {
        var directory = Path.Combine(_env.WebRootPath, "img", "products");
        Directory.CreateDirectory(directory);

        var fileName = Guid.NewGuid() + extension;
        await using var stream = new FileStream(Path.Combine(directory, fileName), FileMode.CreateNew);
        await file.CopyToAsync(stream);

        return $"products/{fileName}";
    }

    private async Task DeleteUnusedUploads(IEnumerable<string> urls)
    {
        var productsDir = Path.GetFullPath(Path.Combine(_env.WebRootPath, "img", "products"));

        foreach (var url in urls)
        {
            if (await _context.ProductImages.AnyAsync(i => i.Url == url)) continue;

            var path = Path.GetFullPath(Path.Combine(_env.WebRootPath, "img", url));
            var isUpload = Guid.TryParse(Path.GetFileNameWithoutExtension(path), out _);

            if (isUpload && path.StartsWith(productsDir + Path.DirectorySeparatorChar) && System.IO.File.Exists(path))
                System.IO.File.Delete(path);
        }
    }
}