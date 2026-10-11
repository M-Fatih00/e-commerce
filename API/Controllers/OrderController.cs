using System.Security.Claims;
using API.Data;
using API.DTO;
using API.Entity;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe;
using Stripe.Checkout;
using Coupon = API.Entity.Coupon;
using OrderItem = API.Entity.OrderItem;

namespace API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class OrderController : ControllerBase
{
    private const string Pending = "Beklemede";
    private const string Paid = "Ödendi";
    private const string Shipped = "Kargoda";
    private const string Delivered = "Teslim Edildi";
    private const string Cancelled = "İptal";


    private static readonly Dictionary<string, string[]> AllowedTransitions = new()
    {
        [Pending] = new[] { Cancelled },
        [Paid] = new[] { Shipped, Cancelled },
        [Shipped] = new[] { Delivered }
    };

    private readonly DataContext _context;
    private readonly IConfiguration _config;
    private readonly ILogger<OrderController> _logger;

    public OrderController(DataContext context, IConfiguration config, ILogger<OrderController> logger)
    {
        _context = context;
        _config = config;
        _logger = logger;
    }

    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;
    private string GetUsername() => User.FindFirstValue(ClaimTypes.Name)!;

    private static long ToMinorUnits(decimal amount) =>
        (long)Math.Round(amount * 100m, MidpointRounding.AwayFromZero);

    private async Task<string> GenerateUniqueOrderNumber()
    {
        var prefix = _config["Order:NumberPrefix"] ?? "ES";

        for (var attempt = 0; attempt < 5; attempt++)
        {
            var number = OrderNumberGenerator.Generate(prefix);
            if (!await _context.Orders.AnyAsync(o => o.OrderNumber == number))
                return number;
        }

        throw new InvalidOperationException("Benzersiz sipariş numarası üretilemedi.");
    }


    [HttpGet]
    public async Task<ActionResult<List<OrderDTO>>> GetOrders()
    {
        var userId = GetUserId();
        var orders = await _context.Orders
            .AsNoTracking()
            .Where(o => o.CustomerId == userId && o.IyzicoPaymentId != null)
            .Include(o => o.OrderItems)
            .OrderByDescending(o => o.SiparisTarihi)
            .ToListAsync();

        return Ok(orders.Select(MapToDTO));
    }

    [HttpGet("all")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<OrderDTO>>> GetAllOrders()
    {
        var orders = await _context.Orders
            .AsNoTracking()
            .Include(o => o.OrderItems)
            .OrderByDescending(o => o.SiparisTarihi)
            .ToListAsync();

        return Ok(orders.Select(MapToDTO));
    }

    [HttpGet("recent")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<OrderDTO>>> GetRecentOrders()
    {
        var orders = await _context.Orders
            .AsNoTracking()
            .Where(o => o.IyzicoPaymentId != null)
            .Include(o => o.OrderItems)
            .OrderByDescending(o => o.SiparisTarihi)
            .Take(5)
            .ToListAsync();

        return Ok(orders.Select(MapToDTO));
    }

    [HttpGet("{id}", Name = "GetOrder")]
    public async Task<ActionResult<OrderDTO>> GetOrder(int id)
    {
        var userId = GetUserId();
        var order = await _context.Orders
            .AsNoTracking()
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.CustomerId == userId && o.Id == id);

        if (order == null)
            return NotFound(new { message = "Sipariş bulunamadı." });

        return Ok(MapToDTO(order));
    }

    [HttpPut("{id}/durum")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateDurum(int id, [FromBody] string? durum)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
            return NotFound(new { message = "Sipariş bulunamadı." });

        var error = await ChangeStatus(order, durum);
        if (error != null)
            return BadRequest(new { message = error });

        return Ok(MapToDTO(order));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CancelOrder(int id)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
            return NotFound(new { message = "Sipariş bulunamadı." });

        var error = await ChangeStatus(order, Cancelled);
        if (error != null)
            return BadRequest(new { message = error });

        return Ok(new { message = "Sipariş iptal edildi." });
    }

    [HttpPost("create")]
    public async Task<IActionResult> CreateOrder(CreateOrderDTO dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var phoneDigits = new string(dto.Telefon.Where(char.IsDigit).ToArray());
        if (phoneDigits.Length < 10 || phoneDigits.Length > 12)
            return BadRequest(new { message = "Geçerli bir telefon numarası girin." });

        var clientUrl = _config["ClientUrl"]?.TrimEnd('/');
        if (string.IsNullOrWhiteSpace(clientUrl))
        {
            _logger.LogError("ClientUrl ayarı tanımlı değil.");
            return StatusCode(500, new { message = "Ödeme sayfası oluşturulamadı." });
        }

        var userId = GetUserId();

        var cart = await _context.Carts
            .Include(c => c.CartItems).ThenInclude(i => i.Urun).ThenInclude(p => p.Images)
            .Include(c => c.CartItems).ThenInclude(i => i.Urun).ThenInclude(p => p.Sizes)
            .AsSplitQuery()
            .FirstOrDefaultAsync(c => c.CustomerId == userId);

        if (cart == null || !cart.CartItems.Any())
            return BadRequest(new { message = "Sepetiniz boş." });

        var stockError = ValidateStock(cart);
        if (stockError != null)
            return BadRequest(new { message = stockError });

        Coupon? coupon = null;
        var couponCode = CouponController.NormalizeCode(dto.KuponKodu);

        if (couponCode.Length > 0)
        {
            coupon = await _context.Coupons.FirstOrDefaultAsync(c => c.Code == couponCode);
            if (coupon == null)
                return BadRequest(new { message = "Kupon geçersiz." });

            if (await _context.CouponUsages.AnyAsync(u => u.CouponId == coupon.Id && u.UserId == userId))
                return BadRequest(new { message = "Bu kuponu daha önce kullandınız." });
        }

        await CancelPendingOrders(userId);

        var araToplam = cart.AraToplam();
        var indirimliToplam = cart.Toplam();
        var kuponIndirimi = coupon == null
            ? 0m
            : Math.Round(indirimliToplam * coupon.DiscountPercent / 100, 2, MidpointRounding.AwayFromZero);
        var teslimatUcreti = ShippingRules.Calculate(indirimliToplam, dto.HizliKargo);
        var toplam = indirimliToplam - kuponIndirimi + teslimatUcreti;

        var orderNumber = await GenerateUniqueOrderNumber();

        var order = new Order
        {
            OrderNumber = orderNumber,
            CustomerId = userId,
            Username = GetUsername(),
            AdSoyad = dto.AdSoyad.Trim(),
            Telefon = phoneDigits,
            Sehir = dto.Sehir.Trim(),
            AdresSatiri = dto.AdresSatiri.Trim(),
            PostaKodu = dto.PostaKodu.Trim(),
            SiparisNotu = dto.SiparisNotu?.Trim() ?? "",
            AraToplam = araToplam,
            KuponIndirimi = kuponIndirimi,
            KuponKodu = coupon?.Code,
            TeslimatUcreti = teslimatUcreti,
            Toplam = toplam,
            Durum = Pending,
            OrderItems = cart.CartItems.Select(i => new OrderItem
            {
                UrunId = i.UrunId,
                UrunAdi = i.Urun.Name,
                UrunResmi = i.Urun.Images.FirstOrDefault(x => x.IsMain)?.Url ?? "",
                Fiyat = Cart.UnitPrice(i.Urun),
                Miktar = i.Miktar,
                Beden = i.Beden
            }).ToList()
        };

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        Session session;
        try
        {
            session = await new SessionService().CreateAsync(new SessionCreateOptions
            {
                PaymentMethodTypes = new List<string> { "card" },
                Mode = "payment",
                ExpiresAt = DateTime.UtcNow.AddMinutes(31),
                ClientReferenceId = order.Id.ToString(),
                LineItems = new List<SessionLineItemOptions>
                {
                    new()
                    {
                        Quantity = 1,
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            Currency = "try",
                            UnitAmount = ToMinorUnits(order.Toplam),
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = "Sipariş " + order.OrderNumber
                            }
                        }
                    }
                },
                SuccessUrl = $"{clientUrl}/order-success?order={order.OrderNumber}&session_id={{CHECKOUT_SESSION_ID}}",
                CancelUrl = $"{clientUrl}/order-failed?order={order.OrderNumber}",
                Metadata = new Dictionary<string, string> { { "orderId", order.Id.ToString() } }
            });
        }
        catch (StripeException ex)
        {
            _logger.LogError(ex, "Stripe oturumu oluşturulamadı. Sipariş: {OrderId}", order.Id);
            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();
            return StatusCode(502, new { message = "Ödeme sayfası oluşturulamadı. Lütfen tekrar deneyin." });
        }

        order.IyzicoToken = session.Id;
        await _context.SaveChangesAsync();

        var result = MapToDTO(order);
        result.StripeSessionUrl = session.Url;

        return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, result);
    }

    [HttpPost("abandon/{orderNumber}")]
    public async Task<IActionResult> AbandonOrder(string orderNumber)
    {
        var userId = GetUserId();
        var order = await _context.Orders
            .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber && o.CustomerId == userId);

        if (order == null || order.Durum != Pending)
            return Ok();

        if (await TryCloseCheckoutSession(order))
        {
            order.Durum = Cancelled;
            await _context.SaveChangesAsync();
        }

        return Ok();
    }

    [AllowAnonymous]
    [HttpPost("callback")]
    public async Task<IActionResult> Callback([FromQuery] string? order, [FromQuery] string? session_id)
    {
        if (string.IsNullOrWhiteSpace(order) || string.IsNullOrWhiteSpace(session_id))
            return BadRequest(new { message = "Geçersiz ödeme bilgisi." });

        var orderEntity = await _context.Orders
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.OrderNumber == order);

        if (orderEntity == null || orderEntity.IyzicoToken != session_id)
            return BadRequest(new { message = "Geçersiz ödeme bilgisi." });

        if (orderEntity.IyzicoPaymentId != null)
            return orderEntity.Durum == Cancelled
                ? Conflict(new { message = "Ödemeniz alındı ancak ürün stokta kalmadı. Ödemeniz iade edildi." })
                : Ok();

        Session session;
        try
        {
            session = await new SessionService().GetAsync(session_id);
        }
        catch (StripeException ex)
        {
            _logger.LogError(ex, "Stripe oturumu alınamadı. Sipariş: {OrderNumber}", order);
            return StatusCode(502, new { message = "Ödeme doğrulanamadı. Lütfen tekrar deneyin." });
        }

        if (!IsValidPaidSession(orderEntity, session))
        {
            _logger.LogWarning("Ödeme doğrulaması başarısız. Sipariş: {OrderNumber}, Durum: {Status}", order, session.PaymentStatus);
            return BadRequest(new { message = "Ödeme doğrulanamadı." });
        }

        if (!await MarkAsPaid(orderEntity, session.PaymentIntentId))
            return Conflict(new { message = "Ödemeniz alındı ancak ürün stokta kalmadı. Ödemeniz iade edildi." });

        return Ok();
    }

    private static bool IsValidPaidSession(Order order, Session session)
    {
        var metadataMatches = session.Metadata != null
            && session.Metadata.TryGetValue("orderId", out var metaOrderId)
            && metaOrderId == order.Id.ToString();

        return session.PaymentStatus == "paid"
            && metadataMatches
            && session.AmountTotal == ToMinorUnits(order.Toplam)
            && string.Equals(session.Currency, "try", StringComparison.OrdinalIgnoreCase);
    }

    private async Task<bool> MarkAsPaid(Order order, string paymentIntentId)
    {
        order.IyzicoPaymentId = paymentIntentId;

        var reservations = new List<(ProductSize Size, int Quantity)>();
        foreach (var item in order.OrderItems)
        {
            var sizeData = await FindSize(item);
            if (sizeData != null)
                reservations.Add((sizeData, item.Miktar));
        }

        var outOfStock = reservations
            .GroupBy(r => r.Size.Id)
            .Any(g => g.First().Size.Stock < g.Sum(r => r.Quantity));

        if (outOfStock)
        {
            try
            {
                await new RefundService().CreateAsync(new RefundCreateOptions { PaymentIntent = paymentIntentId });
                order.Durum = Cancelled;
                await _context.SaveChangesAsync();
                _logger.LogWarning("Stok yetersiz, ödeme iade edildi. Sipariş: {OrderId}", order.Id);
                return false;
            }
            catch (StripeException ex)
            {
                _logger.LogError(ex, "Stok yetersiz ve iade başarısız. Elle kontrol gerekli. Sipariş: {OrderId}", order.Id);
            }
        }

        order.Durum = Paid;

        foreach (var (size, quantity) in reservations)
            size.Stock = Math.Max(0, size.Stock - quantity);

        if (!string.IsNullOrEmpty(order.KuponKodu) && order.CustomerId != null)
        {
            var coupon = await _context.Coupons.FirstOrDefaultAsync(c => c.Code == order.KuponKodu);
            if (coupon != null && !await _context.CouponUsages.AnyAsync(u => u.CouponId == coupon.Id && u.UserId == order.CustomerId))
                _context.CouponUsages.Add(new CouponUsage { CouponId = coupon.Id, UserId = order.CustomerId });
        }

        var cart = await _context.Carts
            .Include(c => c.CartItems)
            .FirstOrDefaultAsync(c => c.CustomerId == order.CustomerId);

        if (cart != null)
            _context.Carts.Remove(cart);

        await _context.SaveChangesAsync();

        await CloseOutOfStockCheckouts(order.Id);

        return true;
    }

    private async Task CloseOutOfStockCheckouts(int paidOrderId)
    {
        var pendingOrders = await _context.Orders
            .Include(o => o.OrderItems)
            .Where(o => o.Id != paidOrderId && o.Durum == Pending)
            .ToListAsync();

        foreach (var pending in pendingOrders)
        {
            var lacksStock = false;

            foreach (var group in pending.OrderItems.GroupBy(i => new { i.UrunId, i.Beden }))
            {
                var size = await FindSize(group.First());
                if (size != null && size.Stock < group.Sum(i => i.Miktar))
                {
                    lacksStock = true;
                    break;
                }
            }

            if (lacksStock && await TryCloseCheckoutSession(pending))
                pending.Durum = Cancelled;
        }

        await _context.SaveChangesAsync();
    }

    private async Task<string?> ChangeStatus(Order order, string? newStatus)
    {
        if (string.IsNullOrWhiteSpace(newStatus))
            return "Durum zorunludur.";

        newStatus = newStatus.Trim();

        if (!AllowedTransitions.TryGetValue(order.Durum, out var targets) || !targets.Contains(newStatus))
            return $"\"{order.Durum}\" durumundaki sipariş \"{newStatus}\" durumuna alınamaz.";

        if (newStatus == Cancelled && order.Durum == Pending && !await TryCloseCheckoutSession(order))
            return "Bu siparişin ödemesi tamamlanmış görünüyor. Sayfayı yenileyip tekrar deneyin.";

        if (newStatus == Cancelled && order.Durum == Paid)
        {
            try
            {
                await new RefundService().CreateAsync(new RefundCreateOptions { PaymentIntent = order.IyzicoPaymentId });
            }
            catch (StripeException ex)
            {
                _logger.LogError(ex, "İade başarısız. Sipariş: {OrderId}", order.Id);
                return "Ödeme iadesi yapılamadı. Sipariş iptal edilmedi.";
            }

            foreach (var item in order.OrderItems)
            {
                var sizeData = await FindSize(item);
                if (sizeData != null) sizeData.Stock += item.Miktar;
            }
        }

        order.Durum = newStatus;
        await _context.SaveChangesAsync();
        return null;
    }

    private async Task CancelPendingOrders(string userId)
    {
        var pendingOrders = await _context.Orders
            .Where(o => o.CustomerId == userId && o.Durum == Pending)
            .ToListAsync();

        foreach (var order in pendingOrders)
        {
            if (await TryCloseCheckoutSession(order))
                order.Durum = Cancelled;
        }

        await _context.SaveChangesAsync();
    }

    private async Task<bool> TryCloseCheckoutSession(Order order)
    {
        if (string.IsNullOrEmpty(order.IyzicoToken)) return true;

        var service = new SessionService();
        try
        {
            var session = await service.GetAsync(order.IyzicoToken);
            if (session.Status == "complete") return false;
            if (session.Status == "open") await service.ExpireAsync(order.IyzicoToken);
            return true;
        }
        catch (StripeException ex)
        {
            _logger.LogWarning(ex, "Stripe oturumu kapatılamadı. Sipariş: {OrderId}", order.Id);
            return false;
        }
    }

    private Task<ProductSize?> FindSize(OrderItem item)
    {
        if (string.IsNullOrEmpty(item.Beden) || !Enum.TryParse<ProductSizeType>(item.Beden, true, out var size))
            return Task.FromResult<ProductSize?>(null);

        return _context.ProductSizes.FirstOrDefaultAsync(s => s.ProductId == item.UrunId && s.Size == size);
    }

    private static string? ValidateStock(Cart cart)
    {
        foreach (var group in cart.CartItems.GroupBy(i => new { i.UrunId, i.Beden }))
        {
            var product = group.First().Urun;
            if (product.Sizes.Count == 0) continue;

            if (string.IsNullOrEmpty(group.Key.Beden) || !Enum.TryParse<ProductSizeType>(group.Key.Beden, true, out var size))
                return $"\"{product.Name}\" için beden seçilmemiş.";

            var stock = product.Sizes.FirstOrDefault(s => s.Size == size)?.Stock ?? 0;
            var quantity = group.Sum(i => i.Miktar);

            if (quantity > stock)
                return stock == 0
                    ? $"\"{product.Name}\" ({group.Key.Beden}) stokta kalmadı."
                    : $"\"{product.Name}\" ({group.Key.Beden}) için en fazla {stock} adet sipariş verebilirsiniz.";
        }

        return null;
    }

    private static OrderDTO MapToDTO(Order order) => new()
    {
        Id = order.Id,
        OrderNumber = order.OrderNumber,
        SiparisTarihi = order.SiparisTarihi,
        AdSoyad = order.AdSoyad,
        Username = order.Username,
        Sehir = order.Sehir,
        AdresSatiri = order.AdresSatiri,
        PostaKodu = order.PostaKodu,
        Telefon = order.Telefon,
        SiparisNotu = order.SiparisNotu,
        Durum = order.Durum,
        OdemeAlindi = order.IyzicoPaymentId != null,
        AraToplam = order.AraToplam,
        KuponIndirimi = order.KuponIndirimi,
        KuponKodu = order.KuponKodu,
        TeslimatUcreti = order.TeslimatUcreti,
        Toplam = order.Toplam,
        StripeSessionUrl = null,
        OrderItems = order.OrderItems.Select(i => new OrderItemDTO
        {
            Id = i.Id,
            UrunId = i.UrunId,
            UrunAdi = i.UrunAdi,
            UrunResmi = i.UrunResmi,
            Fiyat = i.Fiyat,
            Miktar = i.Miktar,
            Beden = i.Beden
        }).ToList()
    };
}