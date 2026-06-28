namespace API.Entity;

public class ProductReview
{
    public int Id { get; set; }

    public string Text { get; set; } = string.Empty;

    public int Rating { get; set; }

    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public string UserId { get; set; } = string.Empty;
    public AppUser User { get; set; } = null!;

    public DateTime CreatedDate { get; set; }
}