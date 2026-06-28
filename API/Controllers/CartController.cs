using System.Security.Claims;
using API.Data;
using API.DTO;
using API.Entity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CartController : ControllerBase
{
    private readonly DataContext _context;

    public CartController(DataContext context)
    {
        _context = context;
    }

    private string GetUserId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    private async Task<Cart?> GetUserCart() =>
        await _context.Carts
            .Include(c => c.CartItems)
            .ThenInclude(i => i.Urun)
            .ThenInclude(p => p.Images)
            .FirstOrDefaultAsync(c => c.CustomerId == GetUserId());

    private CartDTO MapToDTO(Cart cart) => new CartDTO
    {
        CartId = cart.CartId,
        CustomerId = cart.CustomerId,
        AraToplam = cart.AraToplam(),
        Toplam = cart.Toplam(),
        CartItems = cart.CartItems.Select(i => new CartItemDTO
        {
            CartItemId = i.CartItemId,
            UrunId = i.UrunId,
            UrunAdi = i.Urun.Name,
            UrunResim = i.Urun.Images.FirstOrDefault(x => x.IsMain)?.Url ?? "",
            Fiyat = i.Urun.NewPrice,
            Indirim = i.Urun.Discount,
            Miktar = i.Miktar,
            Beden = i.Beden,
            Renk = i.Renk
        }).ToList()
    };

    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var cart = await GetUserCart();
        if (cart == null)
            return Ok(new CartDTO
            {
                CartItems = new List<CartItemDTO>()
            });
        return Ok(MapToDTO(cart));
    }

    [HttpPost]
    public async Task<IActionResult> AddItem(int urunId, int miktar = 1, string? beden = null, string? renk = null)
    {
        var cart = await GetUserCart();

        if (cart == null)
        {
            cart = new Cart { CustomerId = GetUserId() };
            _context.Carts.Add(cart);
        }

        var product = await _context.Products
            .Include(p => p.Images)
            .Include(p => p.Sizes)
            .FirstOrDefaultAsync(p => p.Id == urunId);
        if (product == null) return NotFound("Ürün bulunamadı.");

        // Stok kontrolü
        if (beden != null)
        {
            if (Enum.TryParse<ProductSizeType>(beden, true, out var parsedSize))
            {
                var sizeData = product.Sizes.FirstOrDefault(s => s.Size == parsedSize);
                if (sizeData == null || sizeData.Stock <= 0)
                    return BadRequest(new { message = "Bu beden için stok bulunmuyor." });

                // O bedendeki TÜM renklerin sepetteki toplam miktarını hesapla
                var currentInCart = cart.CartItems
                    .Where(i => i.UrunId == urunId && i.Beden == beden)
                    .Sum(i => i.Miktar);

                if (currentInCart + miktar > sizeData.Stock)
                    return BadRequest(new { message = $"Stok yetersiz. Maksimum {sizeData.Stock} adet ekleyebilirsiniz." });

            }
        }
        else if (product.Sizes != null && product.Sizes.Any())
        {
            // Ürünün bedenleri varsa beden seçimi zorunlu
            return BadRequest(new { message = "Lütfen bir beden seçiniz." });
        }
        else
        {
            // Şu an bedensiz ürünlerde stok takibi yapılmıyorsa bura boş kalabilir
        }

        cart.AddItem(product, miktar, beden, renk);
        await _context.SaveChangesAsync();

        return Ok(MapToDTO(cart));
    }


    [HttpDelete]
    public async Task<IActionResult> RemoveItem(int urunId, int miktar = 1, string? beden = null, string? renk = null)
    {
        var cart = await GetUserCart();
        if (cart == null) return NotFound("Sepet bulunamadı.");

        cart.DeleteItem(urunId, miktar, beden, renk);
        await _context.SaveChangesAsync();
        return Ok(MapToDTO(cart));
    }

    [HttpDelete("clear")]
    public async Task<IActionResult> ClearCart()
    {
        var cart = await GetUserCart();
        if (cart == null) return NotFound("Sepet bulunamadı.");

        cart.CartItems.Clear();
        await _context.SaveChangesAsync();

        return Ok("Sepet temizlendi.");
    }
}