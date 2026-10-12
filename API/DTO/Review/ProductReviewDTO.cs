namespace API.DTO;

public class ProductReviewDTO
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public int Rating { get; set; }
    public int ProductId { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public string? AuthorAvatar { get; set; }
    public bool IsMine { get; set; }
    public DateTime CreatedDate { get; set; }
}