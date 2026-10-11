using System.ComponentModel.DataAnnotations;

namespace API.DTO;

public class UpdateProductDTO
{
    [MaxLength(150, ErrorMessage = "Ürün adı en fazla 150 karakter olabilir.")]
    public string? Name { get; set; }

    [MaxLength(4000, ErrorMessage = "Açıklama en fazla 4000 karakter olabilir.")]
    public string? Description { get; set; }

    public decimal? OldPrice { get; set; }
    public decimal? NewPrice { get; set; }
    public int? CategoryId { get; set; }

    public List<IFormFile>? NewImages { get; set; }
    public List<string>? Colors { get; set; }
    public List<string>? Sizes { get; set; }
    public List<int>? Stocks { get; set; }
}