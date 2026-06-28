using API.Entity;

namespace API.DTO;

public class BlogDetailDTO
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Img { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int ReviewCount { get; set; }

    public DateTime CreatedDate { get; set; }

    public DateTime UpdatedDate { get; set; }
}