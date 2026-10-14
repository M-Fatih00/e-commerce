using System.ComponentModel.DataAnnotations;

namespace API.DTO;

public class CreateBlogDTO
{
    [Required(ErrorMessage = "Başlık zorunludur.")]
    [MaxLength(200, ErrorMessage = "Başlık en fazla 200 karakter olabilir.")]
    public string Title { get; set; } = string.Empty;

    [Required(ErrorMessage = "Görsel zorunludur.")]
    public IFormFile? Image { get; set; }

    [Required(ErrorMessage = "Blog içeriği zorunludur.")]
    [MaxLength(50000, ErrorMessage = "Blog içeriği çok uzun.")]
    public string Description { get; set; } = string.Empty;
}