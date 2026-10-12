using System.Globalization;
using System.Security.Claims;
using API.Data;
using API.DTO;
using API.Entity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductReviewController : ControllerBase
{
    private const int MinTextLength = 3;
    private static readonly CultureInfo Turkish = new("tr-TR");

    private readonly DataContext _context;

    public ProductReviewController(DataContext context)
    {
        _context = context;
    }

    private string? CurrentUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier);

    [HttpGet("{productId}")]
    public async Task<IActionResult> GetByProduct(int productId)
    {
        var source = _context.ProductReviews
            .Where(x => x.ProductId == productId)
            .OrderByDescending(x => x.CreatedDate);

        var reviews = await Project(source, CurrentUserId()).ToListAsync();
        reviews.ForEach(r => r.AuthorName = MaskName(r.AuthorName));

        return Ok(reviews);
    }

    [Authorize]
    [HttpPost]
    [EnableRateLimiting("review")]
    public async Task<IActionResult> Create(CreateProductReviewDTO dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = CurrentUserId();
        if (userId == null) return Unauthorized();

        var text = dto.Text.Trim();
        if (text.Length < MinTextLength)
            return BadRequest(new { message = $"Yorum en az {MinTextLength} karakter olmalıdır." });

        if (!await _context.Products.AnyAsync(p => p.Id == dto.ProductId))
            return NotFound(new { message = "Ürün bulunamadı." });

        if (await _context.ProductReviews.AnyAsync(r => r.ProductId == dto.ProductId && r.UserId == userId))
            return BadRequest(new { message = "Bu ürün için zaten bir yorum yaptınız. Mevcut yorumunuzu düzenleyebilirsiniz." });

        var review = new ProductReview
        {
            ProductId = dto.ProductId,
            Text = text,
            Rating = dto.Rating,
            UserId = userId,
            CreatedDate = DateTime.UtcNow
        };

        _context.ProductReviews.Add(review);
        await _context.SaveChangesAsync();

        return Ok(await LoadReview(review.Id, userId));
    }

    [Authorize]
    [HttpPut("{id}")]
    [EnableRateLimiting("review")]
    public async Task<IActionResult> Update(int id, UpdateProductReviewDTO dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = CurrentUserId();
        if (userId == null) return Unauthorized();

        var text = dto.Text.Trim();
        if (text.Length < MinTextLength)
            return BadRequest(new { message = $"Yorum en az {MinTextLength} karakter olmalıdır." });

        var review = await _context.ProductReviews.FindAsync(id);
        if (review == null)
            return NotFound(new { message = "Yorum bulunamadı." });

        if (review.UserId != userId)
            return Forbid();

        review.Text = text;
        review.Rating = dto.Rating;
        await _context.SaveChangesAsync();

        return Ok(await LoadReview(review.Id, userId));
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = CurrentUserId();
        if (userId == null) return Unauthorized();

        var review = await _context.ProductReviews.FindAsync(id);
        if (review == null)
            return NotFound(new { message = "Yorum bulunamadı." });

        if (review.UserId != userId && !User.IsInRole("Admin"))
            return Forbid();

        _context.ProductReviews.Remove(review);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static IQueryable<ProductReviewDTO> Project(IQueryable<ProductReview> source, string? userId) =>
        source.AsNoTracking().Select(x => new ProductReviewDTO
        {
            Id = x.Id,
            Text = x.Text,
            Rating = x.Rating,
            ProductId = x.ProductId,
            AuthorName = x.User.FullName,
            AuthorAvatar = x.User.Avatar,
            IsMine = userId != null && x.UserId == userId,
            CreatedDate = x.CreatedDate
        });

    private async Task<ProductReviewDTO> LoadReview(int id, string? userId)
    {
        var dto = await Project(_context.ProductReviews.Where(r => r.Id == id), userId).FirstAsync();
        dto.AuthorName = MaskName(dto.AuthorName);
        return dto;
    }

    private static string MaskName(string? fullName)
    {
        var parts = (fullName ?? "").Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 0) return "Kullanıcı";
        if (parts.Length == 1) return parts[0];
        return $"{parts[0]} {char.ToUpper(parts[^1][0], Turkish)}.";
    }
}