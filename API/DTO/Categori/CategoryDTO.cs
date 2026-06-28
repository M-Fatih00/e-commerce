namespace API.DTO;

public class CategoryDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? ImageUrl { get; set; }
    public int ProductCount { get; set; }
}