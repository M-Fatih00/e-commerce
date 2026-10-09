using System.ComponentModel.DataAnnotations;

namespace API.DTO;

public class CreateOrderDTO
{
    [Required(ErrorMessage = "Ad soyad zorunludur.")]
    [MaxLength(100, ErrorMessage = "Ad soyad en fazla 100 karakter olabilir.")]
    public string AdSoyad { get; set; } = null!;

    [Required(ErrorMessage = "Telefon zorunludur.")]
    [MaxLength(20, ErrorMessage = "Telefon en fazla 20 karakter olabilir.")]
    public string Telefon { get; set; } = null!;

    [Required(ErrorMessage = "Şehir zorunludur.")]
    [MaxLength(50, ErrorMessage = "Şehir en fazla 50 karakter olabilir.")]
    public string Sehir { get; set; } = null!;

    [Required(ErrorMessage = "Adres zorunludur.")]
    [MaxLength(250, ErrorMessage = "Adres en fazla 250 karakter olabilir.")]
    public string AdresSatiri { get; set; } = null!;

    [Required(ErrorMessage = "Posta kodu zorunludur.")]
    [RegularExpression(@"^\d{5}$", ErrorMessage = "Posta kodu 5 haneli olmalıdır.")]
    public string PostaKodu { get; set; } = null!;

    [MaxLength(500, ErrorMessage = "Sipariş notu en fazla 500 karakter olabilir.")]
    public string? SiparisNotu { get; set; }

    public bool HizliKargo { get; set; }

    [MaxLength(30)]
    public string? KuponKodu { get; set; }
}