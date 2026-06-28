namespace API.DTO;


public class CreateProductDTO
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public decimal OldPrice { get; set; }
    public decimal NewPrice { get; set; }
    public int Discount { get; set; }

    public int CategoryId { get; set; }

    // Liste olarak geliyor
    public List<IFormFile> Images { get; set; } = new();
    public List<string> Colors { get; set; } = new();
    public List<string> Sizes { get; set; } = new();
}