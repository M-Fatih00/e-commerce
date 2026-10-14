using System.ComponentModel.DataAnnotations;

namespace API.DTO;

public class CreateCategoryDTO
{
    [Required(ErrorMessage = "Kategori adı zorunludur.")]
    [MaxLength(50, ErrorMessage = "Kategori adı en fazla 50 karakter olabilir.")]
    public string Name { get; set; } = null!;

    public IFormFile? Image { get; set; }
}