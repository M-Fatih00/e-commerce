namespace API.DTO;

public class CartDTO
{
    public int CartId { get; set; }
    public string CustomerId { get; set; } = null!;
    public List<CartItemDTO> CartItems { get; set; } = new();
    public decimal AraToplam { get; set; }
    public decimal Toplam { get; set; }
}

public class CartItemDTO
{
    public int CartItemId { get; set; }
    public int UrunId { get; set; }
    public string UrunAdi { get; set; } = null!;
    public string UrunResim { get; set; } = null!;
    public decimal Fiyat { get; set; }
    public int Indirim { get; set; }
    public int Miktar { get; set; }
    public string? Beden { get; set; }
    public string? Renk { get; set; }
}