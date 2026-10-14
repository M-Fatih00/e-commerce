using System.ComponentModel.DataAnnotations;

namespace API.DTO;

public class UpdateSliderDTO
{
    [Range(0, 99, ErrorMessage = "Sıra 0 ile 99 arasında olmalıdır.")]
    public int Index { get; set; }

    public IFormFile? Resim { get; set; }

    public bool Aktif { get; set; }
}