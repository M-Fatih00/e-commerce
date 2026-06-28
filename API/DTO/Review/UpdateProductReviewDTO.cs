namespace API.DTO;

public class UpdateProductReviewDTO
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public int Rating { get; set; }
}