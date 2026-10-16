using System.ComponentModel.DataAnnotations;

namespace API.DTO;

public class ContactInfoDTO
{
    [Required(ErrorMessage = "E-posta zorunludur.")]
    [MaxLength(256, ErrorMessage = "E-posta en fazla 256 karakter olabilir.")]
    [RegularExpression(@"^[^\s@<>()""]+@[^\s@<>()""]+\.[^\s@<>()""]+$", ErrorMessage = "Geçerli bir e-posta adresi girin.")]
    public string Email { get; set; } = null!;

    [Required(ErrorMessage = "Adres zorunludur.")]
    [MaxLength(300, ErrorMessage = "Adres en fazla 300 karakter olabilir.")]
    public string Address { get; set; } = null!;

    [Required(ErrorMessage = "Çalışma saatleri zorunludur.")]
    [MaxLength(500, ErrorMessage = "Çalışma saatleri en fazla 500 karakter olabilir.")]
    public string WorkingHours { get; set; } = null!;
}