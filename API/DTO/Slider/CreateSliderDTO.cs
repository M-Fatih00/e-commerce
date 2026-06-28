using System.ComponentModel.DataAnnotations;

namespace API.DTO;

public class CreateSliderDTO
{
    public int Index { get; set; }

    [Required]
    public IFormFile Resim { get; set; } = null!;
    public bool Aktif { get; set; }
}