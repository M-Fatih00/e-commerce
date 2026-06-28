using System.ComponentModel.DataAnnotations;

namespace API.DTO;

public class CreateBlogDTO
{
    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public IFormFile Image { get; set; } = null!;

    [Required]
    public string Description { get; set; } = string.Empty;
}