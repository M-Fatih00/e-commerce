using System.ComponentModel.DataAnnotations;

namespace API.DTO;

public class UpdateBlogDTO
{
    [MaxLength(200, ErrorMessage = "Başlık en fazla 200 karakter olabilir.")]
    public string? Title { get; set; }

    public IFormFile? Image { get; set; }

    [MaxLength(50000, ErrorMessage = "Blog içeriği çok uzun.")]
    public string? Description { get; set; }
}