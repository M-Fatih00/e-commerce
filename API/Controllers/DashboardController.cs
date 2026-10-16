using System.Globalization;
using API.Data;
using API.Entity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private const string Cancelled = "İptal";
    private const int MonthCount = 6;
    private static readonly CultureInfo Turkish = new("tr-TR");

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
        var paidOrders = _context.Orders
            .AsNoTracking()
            .Where(o => o.IyzicoPaymentId != null && o.Durum != Cancelled);

        var toplamSiparis = await paidOrders.CountAsync();
        var toplamGelir = await paidOrders.SumAsync(o => o.Toplam);
        var toplamKullanici = await _userManager.Users.CountAsync();
        var toplamUrun = await _context.Products.CountAsync();

        var now = DateTime.Now;
        var start = new DateTime(now.Year, now.Month, 1).AddMonths(-(MonthCount - 1));

        var recentPaid = await paidOrders
            .Where(o => o.SiparisTarihi >= start)
            .Select(o => new { o.SiparisTarihi, o.Toplam })
            .ToListAsync();

        var aylikVeri = Enumerable.Range(0, MonthCount)
            .Select(i => start.AddMonths(i))
            .Select(month =>
            {
                var inMonth = recentPaid
                    .Where(o => o.SiparisTarihi.Year == month.Year && o.SiparisTarihi.Month == month.Month)
                    .ToList();

                return new
                {
                    ay = Turkish.DateTimeFormat.GetMonthName(month.Month),
                    siparisSayisi = inMonth.Count,
                    gelir = inMonth.Sum(o => o.Toplam)
                };
            })
            .ToList();

        var sonSiparisler = await _context.Orders
            .AsNoTracking()
            .Where(o => o.IyzicoPaymentId != null)
            .OrderByDescending(o => o.SiparisTarihi)
            .Take(5)
            .Select(o => new { o.OrderNumber, o.AdSoyad, o.Toplam, o.Durum, o.SiparisTarihi })
            .ToListAsync();

        var kategoriSatislari = await _context.OrderItems
            .AsNoTracking()
            .Where(i => i.Order.IyzicoPaymentId != null && i.Order.Durum != Cancelled)
            .GroupBy(i => i.Urun.Category.Name)
            .Select(g => new { kategori = g.Key, adet = g.Sum(x => x.Miktar) })
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