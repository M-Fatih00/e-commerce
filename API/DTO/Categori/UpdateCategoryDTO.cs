namespace API.DTO;

public class UpdateCategoryDTO
{
    public string Name { get; set; } = null!;
    public IFormFile? Image { get; set; }
}