namespace API.DTO;

public class UpdateSliderDTO
{
    public int Id { get; set; }
    public int Index { get; set; }
    public IFormFile? Resim { get; set; }
    public bool Aktif { get; set; }
}