namespace API.DTO;

public class CreateCategoryDTO
{
    public string Name { get; set; } = null!;
    public IFormFile? Image { get; set; }
}