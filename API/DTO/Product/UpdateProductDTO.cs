namespace API.DTO;


public class UpdateProductDTO
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public decimal? OldPrice { get; set; }
    public decimal? NewPrice { get; set; }
    public int? Discount { get; set; }
    public int? CategoryId { get; set; }

    public List<IFormFile>? NewImages { get; set; }

    public List<string>? Colors { get; set; }
    public List<string>? Sizes { get; set; }
    public List<int>? Stocks { get; set; }
}