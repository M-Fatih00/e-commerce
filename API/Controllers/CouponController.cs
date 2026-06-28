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
public class CouponController : ControllerBase
{
    private readonly DataContext _context;

    public CouponController(DataContext context)
    {
        _context = context;
    }

    // GET /api/coupon
    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var coupons = await _context.Coupons
            .Select(c => new CouponDTO { Id = c.Id, Code = c.Code, DiscountPercent = c.DiscountPercent })
            .ToListAsync();
        return Ok(coupons);
    }

    // GET /api/coupon/{id}
    [Authorize(Roles = "Admin")]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var coupon = await _context.Coupons.FindAsync(id);
        if (coupon == null) return NotFound("Kupon bulunamadı.");
        return Ok(new CouponDTO { Id = coupon.Id, Code = coupon.Code, DiscountPercent = coupon.DiscountPercent });
    }

    // POST /api/coupon
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create(CreateCouponDTO dto)
    {
        var exists = await _context.Coupons.AnyAsync(c => c.Code.ToLower() == dto.Code.ToLower());
        if (exists) return BadRequest("Bu kupon kodu zaten mevcut.");

        var coupon = new Coupon
        {
            Code = dto.Code.ToUpper().Trim(),
            DiscountPercent = dto.DiscountPercent
        };

        _context.Coupons.Add(coupon);
        await _context.SaveChangesAsync();
        return Ok(new CouponDTO { Id = coupon.Id, Code = coupon.Code, DiscountPercent = coupon.DiscountPercent });
    }

    // PUT /api/coupon/{id}
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, CreateCouponDTO dto)
    {
        var coupon = await _context.Coupons.FindAsync(id);
        if (coupon == null) return NotFound("Kupon bulunamadı.");

        var duplicate = await _context.Coupons.AnyAsync(c => c.Code.ToLower() == dto.Code.ToLower() && c.Id != id);
        if (duplicate) return BadRequest("Bu kupon kodu zaten kullanılıyor.");

        coupon.Code = dto.Code.ToUpper().Trim();
        coupon.DiscountPercent = dto.DiscountPercent;

        await _context.SaveChangesAsync();
        return Ok(new CouponDTO { Id = coupon.Id, Code = coupon.Code, DiscountPercent = coupon.DiscountPercent });
    }

    // DELETE /api/coupon/{id}
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var coupon = await _context.Coupons.FindAsync(id);
        if (coupon == null) return NotFound("Kupon bulunamadı.");
        _context.Coupons.Remove(coupon);
        await _context.SaveChangesAsync();
        return Ok("Kupon silindi.");
    }

    // POST /api/coupon/apply
    [Authorize]
    [HttpPost("apply")]
    public async Task<IActionResult> Apply(ApplyCouponDTO dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var coupon = await _context.Coupons
            .FirstOrDefaultAsync(c => c.Code == dto.Code.ToUpper().Trim());

        if (coupon == null) return BadRequest(new { message = "Kupon bulunamadı." });

        var cart = await _context.Carts
            .Include(c => c.CartItems)
            .ThenInclude(i => i.Urun)
            .FirstOrDefaultAsync(c => c.CustomerId == userId);

        if (cart == null || !cart.CartItems.Any())
            return BadRequest(new { message = "Sepet boş." });

        var sepetToplam = cart.Toplam();
        var kuponIndirimi = sepetToplam * coupon.DiscountPercent / 100;
        var yeniToplam = sepetToplam - kuponIndirimi;

        return Ok(new ApplyCouponResultDTO
        {
            Code = coupon.Code,
            DiscountPercent = coupon.DiscountPercent,
            KuponIndirimi = kuponIndirimi,
            YeniToplam = yeniToplam
        });
    }
}