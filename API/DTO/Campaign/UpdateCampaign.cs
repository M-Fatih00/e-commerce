using System.ComponentModel.DataAnnotations;

namespace API.DTO;

public class UpdateCampaignDTO
{
    [Required(ErrorMessage = "Başlık zorunludur.")]
    [MaxLength(100, ErrorMessage = "Başlık en fazla 100 karakter olabilir.")]
    public string Title { get; set; } = null!;

    [MaxLength(300, ErrorMessage = "Açıklama en fazla 300 karakter olabilir.")]
    public string? Description { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Kategori seçin.")]
    public int CategoryId { get; set; }

    [Range(0, 99, ErrorMessage = "Sıra 0 ile 99 arasında olmalıdır.")]
    public int Index { get; set; }

    public IFormFile? Resim { get; set; }
}