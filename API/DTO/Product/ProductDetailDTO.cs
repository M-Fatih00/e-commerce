namespace API.DTO;

public class ProductDetailDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public decimal OldPrice { get; set; }
    public decimal NewPrice { get; set; }
    public int Discount { get; set; }

    public string CategoryName { get; set; } = null!;

    public List<string> Images { get; set; } = new();
    public List<string>? Colors { get; set; }
    public List<ProductSizeDTO>? Sizes { get; set; }

    public double AverageRating { get; set; }
    public int ReviewCount { get; set; }
}

public class ProductSizeDTO
{
    public string Size { get; set; } = string.Empty;
    public int Stock { get; set; }
}