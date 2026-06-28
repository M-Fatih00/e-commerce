using API.Entity;

public class Blog
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Img { get; set; } = null!;

    public string Description { get; set; } = string.Empty;

    public DateTime CreatedDate { get; set; }

    public DateTime UpdatedDate { get; set; }
}