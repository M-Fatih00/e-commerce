namespace API.Entity;

public class Campaign
{
    public int Id { get; set; }
    public int Index { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public int CategoryId { get; set; }
    public string ImageUrl { get; set; } = null!;
}