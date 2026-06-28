using System.Security.Claims;
using API.Data;
using API.DTO;
using API.Entity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe;
using Stripe.Checkout;
using OrderItem = API.Entity.OrderItem;

namespace API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class OrderController : ControllerBase
{
    private readonly DataContext _context;
    private readonly IConfiguration _config;

    public OrderController(DataContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;
    private string GetUsername() => User.Identity!.Name!;

    [HttpGet]
    public async Task<ActionResult<List<OrderDTO>>> GetOrders()
    {
        var userId = GetUserId();
        var orders = await _context.Orders
            .Where(o => o.CustomerId == userId)
            .Include(o => o.OrderItems)
            .OrderByDescending(o => o.SiparisTarihi)
            .Select(o => MapToDTO(o))
            .ToListAsync();
        return Ok(orders);
    }

    [HttpGet("all")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<OrderDTO>>> GetAllOrders()
    {
        var orders = await _context.Orders
            .Include(o => o.OrderItems)
            .OrderByDescending(o => o.SiparisTarihi)
            .Select(o => MapToDTO(o))
            .ToListAsync();
        return Ok(orders);
    }

    [HttpGet("{id}", Name = "GetOrder")]
    public async Task<ActionResult<OrderDTO>> GetOrder(int id)
    {
        var userId = GetUserId();
        var order = await _context.Orders
            .Where(o => o.CustomerId == userId && o.Id == id)
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync();
        if (order == null)
            return NotFound(new ProblemDetails { Title = "Sipariş bulunamadı." });
        return Ok(MapToDTO(order));
    }

    [HttpGet("recent")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<OrderDTO>>> GetRecentOrders()
    {
        var orders = await _context.Orders
            .Include(o => o.OrderItems)
            .OrderByDescending(o => o.SiparisTarihi)
            .Take(5)
            .Select(o => MapToDTO(o))
            .ToListAsync();
        return Ok(orders);
    }


    [HttpPut("{id}/durum")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateDurum(int id, [FromBody] string durum)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null) return NotFound();
        order.Durum = durum;
        await _context.SaveChangesAsync();
        return Ok(MapToDTO(order));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CancelOrder(int id)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null) return NotFound();
        order.Durum = "İptal";
        await _context.SaveChangesAsync();
        return Ok();
    }

    [HttpPost("create")]
    public async Task<ActionResult<OrderDTO>> CreateOrder(CreateOrderDTO dto)
    {
        var userId = GetUserId();

        var cart = await _context.Carts
            .Include(c => c.CartItems)
            .ThenInclude(i => i.Urun)
            .ThenInclude(p => p.Images)
            .FirstOrDefaultAsync(c => c.CustomerId == userId);

        if (cart == null || !cart.CartItems.Any())
            return BadRequest(new ProblemDetails { Title = "Sepetiniz boş." });

        var items = cart.CartItems.Select(i => new OrderItem
        {
            UrunId = i.UrunId,
            UrunAdi = i.Urun.Name,
            UrunResmi = i.Urun.Images.FirstOrDefault(x => x.IsMain)?.Url ?? "",
            Fiyat = i.Urun.NewPrice,
            Miktar = i.Miktar,
            Beden = i.Beden
        }).ToList();

        decimal kuponIndirimi = 0;
        string? kuponKodu = null;

        if (!string.IsNullOrEmpty(dto.KuponKodu))
        {
            var kupon = await _context.Coupons
                .Include(c => c.Usages)
                .FirstOrDefaultAsync(c => c.Code == dto.KuponKodu.ToUpper().Trim());

            if (kupon != null)
            {
                kuponKodu = kupon.Code;
                kuponIndirimi = cart.Toplam() * kupon.DiscountPercent / 100;
            }
        }

        decimal araToplam = cart.AraToplam();
        decimal indirimliToplam = cart.Toplam();

        const decimal freeShippingThreshold = 1000m;
        const decimal standartKargo = 29.99m;

        decimal teslimatUcreti = dto.HizliKargo
            ? 150m
            : indirimliToplam >= freeShippingThreshold
            ? 0m
            : standartKargo;

        decimal toplam = cart.Toplam() - kuponIndirimi + teslimatUcreti;

        var order = new Order
        {
            CustomerId = userId,
            Username = GetUsername(),
            AdSoyad = dto.AdSoyad,
            Telefon = dto.Telefon,
            Sehir = dto.Sehir,
            AdresSatiri = dto.AdresSatiri,
            PostaKodu = dto.PostaKodu,
            SiparisNotu = dto.SiparisNotu ?? "",
            AraToplam = araToplam,
            KuponIndirimi = kuponIndirimi,
            KuponKodu = kuponKodu,
            TeslimatUcreti = teslimatUcreti,
            Toplam = toplam,
            Durum = "Beklemede",
            OrderItems = items
        };

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        // Stripe Checkout Session oluştur
        var clientUrl = _config["ClientUrl"];
        var lineItems = new List<SessionLineItemOptions>
        {
            new SessionLineItemOptions
            {
                PriceData = new SessionLineItemPriceDataOptions
                {
                    Currency = "try",
                    UnitAmount = (long)(order.Toplam * 100),
                    ProductData = new SessionLineItemPriceDataProductDataOptions
                    {
                        Name = "Sipariş #" + order.Id,
                    },
                },
                Quantity = 1,
            }
        };

        var options = new SessionCreateOptions
        {
            PaymentMethodTypes = new List<string> { "card" },
            LineItems = lineItems,
            Mode = "payment",
            SuccessUrl = $"{clientUrl}/order-success?orderId={order.Id}&session_id={{CHECKOUT_SESSION_ID}}",
            CancelUrl = $"{clientUrl}/order-failed?orderId={order.Id}",
            Metadata = new Dictionary<string, string>
            {
                { "orderId", order.Id.ToString() }
            }
        };

        var service = new SessionService();
        var session = await service.CreateAsync(options);

        order.IyzicoToken = session.Id; // Stripe session ID'yi saklıyoruz
        await _context.SaveChangesAsync();

        var result = MapToDTO(order);
        result.StripeSessionUrl = session.Url; // Frontend'e redirect URL gönder

        Console.WriteLine($"=== STRIPE SESSION: {session.Id} ===");
        Console.WriteLine($"=== STRIPE URL: {session.Url} ===");
        Console.WriteLine($"=== TOPLAM: {order.Toplam} ===");

        return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, result);
    }

    [AllowAnonymous]
    [HttpPost("callback")]
    public async Task<IActionResult> Callback([FromQuery] int orderId, [FromQuery] string session_id)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null) return Ok();

        try
        {
            var service = new SessionService();
            var session = await service.GetAsync(session_id);

            if (session.PaymentStatus == "paid")
            {
                if (order.Durum == "Ödendi") return Ok();
                order.Durum = "Ödendi";
                order.IyzicoPaymentId = session.PaymentIntentId;

                // Stok düşür
                foreach (var item in order.OrderItems)
                {
                    if (string.IsNullOrEmpty(item.Beden)) continue;

                    var product = await _context.Products
                        .Include(p => p.Sizes)
                        .FirstOrDefaultAsync(p => p.Id == item.UrunId);

                    if (product == null) continue;

                    if (Enum.TryParse<ProductSizeType>(item.Beden, true, out var parsedSize))
                    {
                        var sizeData = product.Sizes.FirstOrDefault(s => s.Size == parsedSize);
                        if (sizeData != null)
                            sizeData.Stock = Math.Max(0, sizeData.Stock - item.Miktar);
                    }
                }

                var cart = await _context.Carts
                    .Include(c => c.CartItems)
                    .FirstOrDefaultAsync(c => c.CustomerId == order.CustomerId);

                if (cart != null)
                    _context.Carts.Remove(cart);

                await _context.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Stripe callback hatası: {ex.Message}");
        }

        return Ok();
    }
    private static OrderDTO MapToDTO(Order order) => new OrderDTO
    {
        Id = order.Id,
        SiparisTarihi = order.SiparisTarihi,
        AdSoyad = order.AdSoyad,
        Username = order.Username,
        Sehir = order.Sehir,
        AdresSatiri = order.AdresSatiri,
        PostaKodu = order.PostaKodu,
        Telefon = order.Telefon,
        SiparisNotu = order.SiparisNotu,
        Durum = order.Durum,
        AraToplam = order.AraToplam,
        KuponIndirimi = order.KuponIndirimi,
        KuponKodu = order.KuponKodu,
        TeslimatUcreti = order.TeslimatUcreti,
        Toplam = order.Toplam,
        IyzicoToken = order.IyzicoToken,
        StripeSessionUrl = null,
        OrderItems = order.OrderItems.Select(i => new OrderItemDTO
        {
            Id = i.Id,
            UrunId = i.UrunId,
            UrunAdi = i.UrunAdi,
            UrunResmi = i.UrunResmi,
            Fiyat = i.Fiyat,
            Miktar = i.Miktar
        }).ToList()
    };

}