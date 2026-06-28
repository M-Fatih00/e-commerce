namespace API.Entity;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public decimal OldPrice { get; set; }
    public decimal NewPrice { get; set; }
    public int Discount { get; set; }

    // İlişkiler
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    
    public List<ProductImage> Images { get; set; } = new();
    public List<ProductColor> Colors { get; set; } = new();
    public List<ProductSize> Sizes { get; set; } = new();
    public List<ProductReview>? ProductReviews { get; set; }
}

public class ProductImage
{
    public int Id { get; set; }
    public string Url { get; set; } = null!;

    public bool IsMain { get; set; }

    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
}


public class ProductColor
{
    public int Id { get; set; }
    public string Color { get; set; } = null!;

    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
}

public enum ProductSizeType
{
    XXS,
    XS,
    S,
    M,
    L,
    XL,
    XXL
}


public class ProductSize
{
    public int Id { get; set; }
    public ProductSizeType Size { get; set; }
    public int Stock { get; set; } = 0;
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
}

