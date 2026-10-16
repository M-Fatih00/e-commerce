using System.ComponentModel.DataAnnotations;

namespace API.DTO;

public class ContactDTO
{
    [Required(ErrorMessage = "Ad soyad zorunludur.")]
    [MaxLength(100, ErrorMessage = "Ad soyad en fazla 100 karakter olabilir.")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "E-posta zorunludur.")]
    [EmailAddress(ErrorMessage = "Geçerli bir e-posta adresi girin.")]
    [MaxLength(256, ErrorMessage = "E-posta en fazla 256 karakter olabilir.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Konu zorunludur.")]
    [MaxLength(150, ErrorMessage = "Konu en fazla 150 karakter olabilir.")]
    public string Subject { get; set; } = string.Empty;

    [Required(ErrorMessage = "Mesaj zorunludur.")]
    [MaxLength(3000, ErrorMessage = "Mesaj en fazla 3000 karakter olabilir.")]
    public string Message { get; set; } = string.Empty;
}