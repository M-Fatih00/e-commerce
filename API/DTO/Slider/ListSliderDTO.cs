namespace API.DTO;

public class ListSliderDTO
{
    public int Id { get; set; }
    public int Index { get; set; }
    public string Resim { get; set; } = null!;
    public bool Aktif { get; set; }
    public string? Baslik { get; set; }
    public string? AltBaslik { get; set; }
    public string? ButonMetni { get; set; }
    public string? ButonLinki { get; set; }
}