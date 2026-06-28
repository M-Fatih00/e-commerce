using API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using API.Entity;

namespace API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly DataContext _context;
    private readonly UserManager<AppUser> _userManager;

    public DashboardController(DataContext context, UserManager<AppUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    [HttpGet]
    public async Task<IActionResult> GetDashboard()
    {
        // Toplam sipariş sayısı
        var toplamSiparis = await _context.Orders.CountAsync();

        // Toplam gelir (sadece ödenen siparişler)
        var toplamGelir = await _context.Orders
            .Where(o => o.Durum == "Ödendi")
            .SumAsync(o => o.Toplam);

        // Toplam kullanıcı sayısı
        var toplamKullanici = await _userManager.Users.CountAsync();

        // Toplam ürün sayısı
        var toplamUrun = await _context.Products.CountAsync();

        // Aylık sipariş sayısı (son 6 ay)
        var altiAyOnce = DateTime.UtcNow.AddMonths(-6);

        var aylikSiparisler = await _context.Orders
            .Where(o => o.SiparisTarihi >= altiAyOnce)
            .GroupBy(o => new { o.SiparisTarihi.Year, o.SiparisTarihi.Month })
            .Select(g => new
            {
                yil = g.Key.Year,
                ay = g.Key.Month,
                siparisSayisi = g.Count(),
                gelir = g.Where(o => o.Durum == "Ödendi").Sum(o => o.Toplam)
            })
            .OrderBy(x => x.yil)
            .ThenBy(x => x.ay)
            .ToListAsync();

        // Ay isimlerini Türkçe formatla
        var ayIsimleri = new[] { "", "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık" };

        var aylikVeri = aylikSiparisler.Select(a => new
        {
            ay = ayIsimleri[a.ay],
            siparisSayisi = a.siparisSayisi,
            gelir = a.gelir
        }).ToList();

        // Son 5 sipariş
        var sonSiparisler = await _context.Orders
            .OrderByDescending(o => o.SiparisTarihi)
            .Take(5)
            .Select(o => new
            {
                o.Id,
                o.AdSoyad,
                o.Toplam,
                o.Durum,
                o.SiparisTarihi
            })
            .ToListAsync();

        // Kategori bazlı satış dağılımı
        var kategoriSatislari = await _context.OrderItems
            .Include(oi => oi.Urun)
            .ThenInclude(p => p.Category)
            .GroupBy(oi => oi.Urun.Category.Name)
            .Select(g => new
            {
                kategori = g.Key,
                adet = g.Sum(x => x.Miktar)
            })
            .OrderByDescending(x => x.adet)
            .Take(6)
            .ToListAsync();

        return Ok(new
        {
            toplamSiparis,
            toplamGelir,
            toplamKullanici,
            toplamUrun,
            aylikVeri,
            sonSiparisler,
            kategoriSatislari
        });
    }
}