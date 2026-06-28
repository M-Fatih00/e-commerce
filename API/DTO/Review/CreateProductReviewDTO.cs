namespace API.DTO;

public class CreateProductReviewDTO
{
    public string Text { get; set; } = string.Empty;

    public int Rating { get; set; }

    public int ProductId { get; set; }
}