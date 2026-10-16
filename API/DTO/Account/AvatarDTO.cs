using System.ComponentModel.DataAnnotations;

namespace API.DTO;

public class AvatarDTO
{
    [Required(ErrorMessage = "Dosya seçilmedi.")]
    public IFormFile? Avatar { get; set; }
}