using System.Security.Claims;
using API.Data;
using API.DTO;
using API.Entity;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CartController : ControllerBase
{
    private const int MaxQuantity = 20;

    private readonly DataContext _context;

    public CartController(DataContext context)
    {
        _context = context;
    }

    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    private Task<Cart?> GetUserCart()
    {
        var userId = GetUserId();
        return _context.Carts
            .Include(c => c.CartItems)
            .ThenInclude(i => i.Urun)
            .ThenInclude(p => p.Images)
            .FirstOrDefaultAsync(c => c.CustomerId == userId);
    }

    private static CartDTO MapToDTO(Cart cart)
    {
        var araToplam = cart.AraToplam();
        var toplam = cart.Toplam();

        return new CartDTO
        {
            CartId = cart.CartId,
            AraToplam = araToplam,
            UrunIndirimi = araToplam - toplam,
            Toplam = toplam,
            KargoUcreti = ShippingRules.Calculate(toplam, false),
            HizliKargoUcreti = ShippingRules.ExpressFee,
            UcretsizKargoLimiti = ShippingRules.FreeShippingThreshold,
            CartItems = cart.CartItems.Select(i =>
            {
                var price = Cart.UnitPrice(i.Urun);
                var listPrice = Cart.ListPrice(i.Urun);

                return new CartItemDTO
                {
                    CartItemId = i.CartItemId,
                    UrunId = i.UrunId,
                    UrunAdi = i.Urun.Name,
                    UrunResim = i.Urun.Images.FirstOrDefault(x => x.IsMain)?.Url ?? "",
                    Fiyat = price,
                    EskiFiyat = listPrice > price ? listPrice : null,
                    Indirim = Product.CalculateDiscount(i.Urun.OldPrice, i.Urun.NewPrice),
                    Miktar = i.Miktar,
                    Beden = i.Beden,
                    Renk = i.Renk
                };
            }).ToList()
        };
    }

    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var cart = await GetUserCart();
        if (cart == null)
            return Ok(MapToDTO(new Cart()));

        return Ok(MapToDTO(cart));
    }

    [HttpPost]
    public async Task<IActionResult> AddItem(int urunId, int miktar = 1, string? beden = null, string? renk = null)
    {
        if (miktar < 1 || miktar > MaxQuantity)
            return BadRequest(new { message = $"Adet 1 ile {MaxQuantity} arasında olmalıdır." });

        var product = await _context.Products
            .Include(p => p.Images)
            .Include(p => p.Sizes)
            .Include(p => p.Colors)
            .FirstOrDefaultAsync(p => p.Id == urunId);

        if (product == null)
            return NotFound(new { message = "Ürün bulunamadı." });

        var cart = await GetUserCart();
        if (cart == null)
        {
            cart = new Cart { CustomerId = GetUserId() };
            _context.Carts.Add(cart);
        }

        string? normalizedSize = null;

        if (product.Sizes.Count > 0)
        {
            if (string.IsNullOrWhiteSpace(beden))
                return BadRequest(new { message = "Lütfen bir beden seçiniz." });

            if (!Enum.TryParse<ProductSizeType>(beden.Trim(), true, out var parsedSize) || !Enum.IsDefined(parsedSize))
                return BadRequest(new { message = "Geçersiz beden." });

            var sizeData = product.Sizes.FirstOrDefault(s => s.Size == parsedSize);
            if (sizeData == null || sizeData.Stock <= 0)
                return BadRequest(new { message = "Bu beden için stok bulunmuyor." });

            normalizedSize = parsedSize.ToString();

            if (cart.QuantityOf(product.Id, normalizedSize) + miktar > sizeData.Stock)
                return BadRequest(new { message = $"Stok yetersiz. Bu bedenden en fazla {sizeData.Stock} adet alabilirsiniz." });
        }
        else if (!string.IsNullOrWhiteSpace(beden))
        {
            return BadRequest(new { message = "Bu ürün için beden seçilemez." });
        }

        string? normalizedColor = null;

        if (!string.IsNullOrWhiteSpace(renk))
        {
            var color = product.Colors.FirstOrDefault(c =>
                string.Equals(c.Color, renk.Trim(), StringComparison.OrdinalIgnoreCase));

            if (color == null)
                return BadRequest(new { message = "Geçersiz renk." });

            normalizedColor = color.Color;
        }

        var lineQuantity = cart.CartItems
            .Where(i => i.UrunId == product.Id && i.Beden == normalizedSize && i.Renk == normalizedColor)
            .Sum(i => i.Miktar);

        if (lineQuantity + miktar > MaxQuantity)
            return BadRequest(new { message = $"Bir üründen en fazla {MaxQuantity} adet ekleyebilirsiniz." });

        cart.AddItem(product, miktar, normalizedSize, normalizedColor);
        await _context.SaveChangesAsync();

        return Ok(MapToDTO(cart));
    }

    [HttpDelete]
    public async Task<IActionResult> RemoveItem(int urunId, int miktar = 1, string? beden = null, string? renk = null)
    {
        if (miktar < 1 || miktar > MaxQuantity)
            return BadRequest(new { message = $"Adet 1 ile {MaxQuantity} arasında olmalıdır." });

        var cart = await GetUserCart();
        if (cart == null)
            return NotFound(new { message = "Sepet bulunamadı." });

        cart.DeleteItem(urunId, miktar, beden, renk);
        await _context.SaveChangesAsync();

        return Ok(MapToDTO(cart));
    }

    [HttpDelete("clear")]
    public async Task<IActionResult> ClearCart()
    {
        var cart = await GetUserCart();
        if (cart == null)
            return Ok(new { message = "Sepet temizlendi." });

        cart.CartItems.Clear();
        await _context.SaveChangesAsync();

        return Ok(new { message = "Sepet temizlendi." });
    }
}