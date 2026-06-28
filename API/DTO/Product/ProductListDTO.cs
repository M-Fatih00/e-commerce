namespace API.DTO;

public class ProductListDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public decimal NewPrice { get; set; }
    public int Discount { get; set; }
    
    public string MainImage { get; set; } = "";
    public string HoverImage { get; set; } = "";

    public int CategoryId { get; set; }
    public double AverageRating { get; set; }

}
