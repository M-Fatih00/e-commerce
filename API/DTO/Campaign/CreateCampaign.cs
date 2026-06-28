namespace API.DTO;

public class CreateCampaignDTO
{
    public int Index { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public int CategoryId { get; set; }
    public IFormFile Resim { get; set; } = null!;
}