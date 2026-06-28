namespace API.DTO;

public class ListBlogDTO
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Img { get; set; } = null!;

    public DateTime CreatedDate { get; set; }

    public int ReviewCount { get; set; }
}