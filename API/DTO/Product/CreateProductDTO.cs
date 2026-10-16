using System.ComponentModel.DataAnnotations;

namespace API.DTO;

public class CreateProductDTO
{
    [Required(ErrorMessage = "Ürün adı zorunludur.")]
    [MaxLength(150, ErrorMessage = "Ürün adı en fazla 150 karakter olabilir.")]
    public string Name { get; set; } = null!;

    [MaxLength(4000, ErrorMessage = "Açıklama en fazla 4000 karakter olabilir.")]
    public string? Description { get; set; }

    public decimal OldPrice { get; set; }
    public int Discount { get; set; }
    public int CategoryId { get; set; }

    public List<IFormFile> Images { get; set; } = new();
    public List<string> Colors { get; set; } = new();
    public List<string> Sizes { get; set; } = new();
    public List<int>? Stocks { get; set; }
}