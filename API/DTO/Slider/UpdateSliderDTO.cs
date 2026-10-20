using System.ComponentModel.DataAnnotations;

namespace API.DTO;

public class UpdateSliderDTO
{
    public IFormFile? Resim { get; set; }

    public bool Aktif { get; set; }

    [StringLength(40, ErrorMessage = "Üst yazı en fazla 40 karakter olabilir.")]
    public string? Baslik { get; set; }

    [StringLength(80, ErrorMessage = "Başlık en fazla 80 karakter olabilir.")]
    public string? AltBaslik { get; set; }

    [StringLength(30, ErrorMessage = "Buton yazısı en fazla 30 karakter olabilir.")]
    public string? ButonMetni { get; set; }

    [StringLength(200, ErrorMessage = "Buton linki en fazla 200 karakter olabilir.")]
    [RegularExpression(@"^/(?!/)[A-Za-z0-9\-._~/?=&%]*$", ErrorMessage = "Buton linki / ile başlayan site içi bir adres olmalıdır (örneğin /shop).")]
    public string? ButonLinki { get; set; }
}