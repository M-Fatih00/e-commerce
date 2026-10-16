using System.ComponentModel.DataAnnotations;

namespace API.DTO;

public class CreateProductReviewDTO
{
    [Required(ErrorMessage = "Yorum zorunludur.")]
    [MaxLength(1000, ErrorMessage = "Yorum en fazla 1000 karakter olabilir.")]
    public string Text { get; set; } = string.Empty;

    [Range(1, 5, ErrorMessage = "Puan 1 ile 5 arasında olmalıdır.")]
    public int Rating { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Ürün bulunamadı.")]
    public int ProductId { get; set; }
}