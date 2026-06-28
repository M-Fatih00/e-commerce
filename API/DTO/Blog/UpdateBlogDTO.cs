namespace API.DTO;

public class UpdateBlogDTO
{
    public int Id { get; set; }

    public string? Title { get; set; }

    public IFormFile? Image { get; set; }

    public string? Description { get; set; }
}