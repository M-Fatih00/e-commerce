namespace API.Entity;

public class Cart
{
    public int CartId { get; set; }
    public string CustomerId { get; set; } = null!;

    public List<CartItem> CartItems { get; set; } = new();

    public void AddItem(Product product, int miktar, string? beden = null, string? renk = null)
    {
        var item = CartItems.FirstOrDefault(i =>
            i.UrunId == product.Id && i.Beden == beden && i.Renk == renk);

        if (item == null)
            CartItems.Add(new CartItem { Urun = product, Miktar = miktar, Beden = beden, Renk = renk });
        else
            item.Miktar += miktar;
    }
    public void DeleteItem(int urunId, int miktar, string? beden = null, string? renk = null)
    {
        var item = CartItems.FirstOrDefault(i =>
            i.UrunId == urunId && i.Beden == beden && i.Renk == renk);
        if (item != null)
        {
            item.Miktar -= miktar;
            if (item.Miktar <= 0) CartItems.Remove(item);
        }
    }

    public decimal AraToplam()
    {
        return CartItems.Sum(i => i.Urun.NewPrice * i.Miktar);
    }

    public decimal Toplam()
    {
        return CartItems.Sum(i =>
        {
            var price = i.Urun.NewPrice;

            if (i.Urun.Discount > 0)
            {
                price = price - (price * i.Urun.Discount / 100);
            }

            return price * i.Miktar;
        });
    }
}


public class CartItem
{
    public int CartItemId { get; set; }
    public int UrunId { get; set; }
    public Product Urun { get; set; } = null!;
    public int CartId { get; set; }
    public Cart Cart { get; set; } = null!;
    public int Miktar { get; set; }
    public string? Beden { get; set; }
    public string? Renk { get; set; }
}