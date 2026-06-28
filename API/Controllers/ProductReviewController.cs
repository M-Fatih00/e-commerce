using System.Security.Claims;
using API.Data;
using API.DTO;
using API.Entity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;


[ApiController]
[Route("api/[controller]")]
public class ProductReviewController : ControllerBase
{
    private readonly DataContext _context;

    public ProductReviewController(DataContext context)
    {
        _context = context;
    }


    [HttpGet("{productId}")]
    public async Task<IActionResult> GetByProduct(int productId)
    {
        var reviews = await _context.ProductReviews
        .Include(x => x.User)
        .Where(x => x.ProductId == productId)
        .OrderByDescending(x => x.CreatedDate)
        .Select(x => new ProductReviewDTO
        {
            Id = x.Id,
            Text = x.Text,
            Rating = x.Rating,
            ProductId = x.ProductId,
            UserId = x.UserId,
            UserName = x.User.UserName!,
            CreatedDate = x.CreatedDate
        })
        .ToListAsync();

        return Ok(reviews);
    }


    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create(CreateProductReviewDTO dto)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId == null)
            return Unauthorized();

        // Ürün var mı?
        var productExists = await _context.Products.AnyAsync(p => p.Id == dto.ProductId);
        if (!productExists)
            return NotFound($"ProductId={dto.ProductId} bulunamadı.");

        // Kullanıcı var mı?
        var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
        if (!userExists)
            return NotFound($"UserId={userId} bulunamadı.");

        // ! Aynı kullanıcı aynı ürüne 1 kez yorum yapabilmesi için
        var isAdmin = User.IsInRole("Admin");
        if (!isAdmin)
        {
            var alreadyReviewed = await _context.ProductReviews
                .AnyAsync(r => r.ProductId == dto.ProductId && r.UserId == userId);
            if (alreadyReviewed)
                return BadRequest(new { message = "Bu ürün için zaten bir yorum yaptınız." });
        }

        var review = new ProductReview
        {
            ProductId = dto.ProductId,
            Text = dto.Text,
            Rating = dto.Rating,
            UserId = userId,
            CreatedDate = DateTime.UtcNow
        };

        _context.ProductReviews.Add(review);
        await _context.SaveChangesAsync();

        return Ok(new ProductReviewDTO
        {
            Id = review.Id,
            Text = review.Text,
            Rating = review.Rating,
            ProductId = review.ProductId,
            UserId = review.UserId,
            UserName = User.FindFirst(ClaimTypes.Name)?.Value ?? "",
            CreatedDate = review.CreatedDate
        });
    }


    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, UpdateProductReviewDTO dto)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var isAdmin = User.IsInRole("Admin");

        if (userId == null)
            return Unauthorized();

        var review = await _context.ProductReviews.FindAsync(id);

        if (review == null)
            return NotFound("Yorum bulunamadı.");

        if (!isAdmin && review.UserId != userId)
            return Forbid();

        review.Text = dto.Text;
        review.Rating = dto.Rating;

        await _context.SaveChangesAsync();

        return Ok(new ProductReviewDTO
        {
            Id = review.Id,
            Text = review.Text,
            Rating = review.Rating,
            ProductId = review.ProductId,
            UserId = review.UserId,
            UserName = User.FindFirst(ClaimTypes.Name)?.Value ?? "",
            CreatedDate = review.CreatedDate
        });
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var isAdmin = User.IsInRole("Admin");

        if (userId == null)
            return Unauthorized();

        var review = await _context.ProductReviews.FindAsync(id);

        if (review == null)
            return NotFound("Yorum bulunamadı.");

        if (!isAdmin && review.UserId != userId)
            return Forbid();

        _context.ProductReviews.Remove(review);
        await _context.SaveChangesAsync();

        return NoContent();
    }


}