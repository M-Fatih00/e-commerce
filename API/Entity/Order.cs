namespace API.Entity;

public class Order
{
    public int Id { get; set; }
    public DateTime SiparisTarihi { get; set; } = DateTime.Now;
    public string AdSoyad { get; set; } = null!;
    public string Username { get; set; } = null!;
    public string Sehir { get; set; } = null!;
    public string AdresSatiri { get; set; } = null!;
    public string? CustomerId { get; set; }
    public string PostaKodu { get; set; } = null!;
    public string Telefon { get; set; } = null!;
    public string SiparisNotu { get; set; } = null!;
    public List<OrderItem> OrderItems { get; set; } = new();
    public decimal AraToplam { get; set; }
    public decimal TeslimatUcreti { get; set; }
    public string Durum { get; set; } = "Beklemede"; 
    public decimal Toplam { get; set; } 
    public string? KuponKodu { get; set; }   
    public decimal KuponIndirimi { get; set; } 
    public string? IyzicoPaymentId { get; set; }
    public string? IyzicoToken { get; set; }

}

public class OrderItem
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public int UrunId { get; set; }
    public Product Urun { get; set; } = null!;
    public string UrunAdi { get; set; } = null!;
    public string UrunResmi { get; set; } = null!;
    public decimal Fiyat { get; set; }
    public int Miktar { get; set; }

    public string? Beden { get; set; }
}