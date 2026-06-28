namespace API.DTO;

public class ProductReviewDTO
{
    public int Id { get; set; }

    public string Text { get; set; } = string.Empty;

    public int Rating { get; set; }

    public int ProductId { get; set; }

    public string UserId { get; set; } = string.Empty;

    public string UserName { get; set; } = string.Empty;

    public DateTime CreatedDate { get; set; }
}