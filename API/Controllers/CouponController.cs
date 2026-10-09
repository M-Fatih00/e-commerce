using System.Security.Claims;
using System.Text.RegularExpressions;
using API.Data;
using API.DTO;
using API.Entity;
using API.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CouponController : ControllerBase
{
    private static readonly Regex CodePattern = new("^[A-Z0-9]{3,30}$", RegexOptions.Compiled);

    private readonly DataContext _context;

    public CouponController(DataContext context)
    {
        _context = context;
    }

    public static string NormalizeCode(string? code) => (code ?? "").Trim().ToUpperInvariant();

    private static string? ValidateCoupon(string code, int discountPercent)
    {
        if (!CodePattern.IsMatch(code))
            return "Kupon kodu 3-30 karakter olmalı ve sadece İngilizce harf ile rakam içermelidir.";

        if (discountPercent < 1 || discountPercent > 90)
            return "İndirim oranı 1 ile 90 arasında olmalıdır.";

        return null;
    }

    private static CouponDTO ToDTO(Coupon c) => new()
    {
        Id = c.Id,
        Code = c.Code,
        DiscountPercent = c.DiscountPercent
    };

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var coupons = await _context.Coupons
            .AsNoTracking()
            .OrderBy(c => c.Code)
            .Select(c => new CouponDTO { Id = c.Id, Code = c.Code, DiscountPercent = c.DiscountPercent })
            .ToListAsync();

        return Ok(coupons);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var coupon = await _context.Coupons.FindAsync(id);
        if (coupon == null)
            return NotFound(new { message = "Kupon bulunamadı." });

        return Ok(ToDTO(coupon));
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    [DemoDisabled]
    public async Task<IActionResult> Create(CreateCouponDTO dto)
    {
        var code = NormalizeCode(dto.Code);

        var error = ValidateCoupon(code, dto.DiscountPercent);
        if (error != null)
            return BadRequest(new { message = error });

        if (await _context.Coupons.AnyAsync(c => c.Code == code))
            return BadRequest(new { message = "Bu kupon kodu zaten mevcut." });

        var coupon = new Coupon { Code = code, DiscountPercent = dto.DiscountPercent };

        _context.Coupons.Add(coupon);
        await _context.SaveChangesAsync();

        return Ok(ToDTO(coupon));
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    [DemoDisabled]
    public async Task<IActionResult> Update(int id, CreateCouponDTO dto)
    {
        var coupon = await _context.Coupons.FindAsync(id);
        if (coupon == null)
            return NotFound(new { message = "Kupon bulunamadı." });

        var code = NormalizeCode(dto.Code);

        var error = ValidateCoupon(code, dto.DiscountPercent);
        if (error != null)
            return BadRequest(new { message = error });

        if (await _context.Coupons.AnyAsync(c => c.Code == code && c.Id != id))
            return BadRequest(new { message = "Bu kupon kodu zaten kullanılıyor." });

        coupon.Code = code;
        coupon.DiscountPercent = dto.DiscountPercent;

        await _context.SaveChangesAsync();

        return Ok(ToDTO(coupon));
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    [DemoDisabled]
    public async Task<IActionResult> Delete(int id)
    {
        var coupon = await _context.Coupons.FindAsync(id);
        if (coupon == null)
            return NotFound(new { message = "Kupon bulunamadı." });

        _context.Coupons.Remove(coupon);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Kupon silindi." });
    }

    [Authorize]
    [HttpPost("apply")]
    [EnableRateLimiting("coupon")]
    public async Task<IActionResult> Apply(ApplyCouponDTO dto)
    {
        var code = NormalizeCode(dto.Code);
        if (code.Length == 0)
            return BadRequest(new { message = "Kupon kodu girin." });

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var coupon = await _context.Coupons
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Code == code);

        if (coupon == null)
            return BadRequest(new { message = "Kupon geçersiz." });

        var alreadyUsed = await _context.CouponUsages
            .AnyAsync(u => u.CouponId == coupon.Id && u.UserId == userId);

        if (alreadyUsed)
            return BadRequest(new { message = "Bu kuponu daha önce kullandınız." });

        var cart = await _context.Carts
            .Include(c => c.CartItems)
            .ThenInclude(i => i.Urun)
            .FirstOrDefaultAsync(c => c.CustomerId == userId);

        if (cart == null || !cart.CartItems.Any())
            return BadRequest(new { message = "Sepetiniz boş." });

        var sepetToplam = cart.Toplam();
        var kuponIndirimi = Math.Round(sepetToplam * coupon.DiscountPercent / 100, 2, MidpointRounding.AwayFromZero);

        return Ok(new ApplyCouponResultDTO
        {
            Code = coupon.Code,
            DiscountPercent = coupon.DiscountPercent,
            KuponIndirimi = kuponIndirimi,
            YeniToplam = sepetToplam - kuponIndirimi
        });
    }
}