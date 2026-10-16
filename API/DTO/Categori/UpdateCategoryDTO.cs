using System.ComponentModel.DataAnnotations;

namespace API.DTO;

public class UpdateCategoryDTO
{
    [MaxLength(50, ErrorMessage = "Kategori adı en fazla 50 karakter olabilir.")]
    public string? Name { get; set; }

    public IFormFile? Image { get; set; }
}