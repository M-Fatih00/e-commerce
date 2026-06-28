using API.Entity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class DataContext(DbContextOptions options) : IdentityDbContext<AppUser, AppRole, string>(options)
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Slider> Sliders => Set<Slider>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Campaign> Campaigns => Set<Campaign>();
    public DbSet<Blog> Blogs => Set<Blog>();
    public DbSet<Coupon> Coupons => Set<Coupon>();
    public DbSet<ProductReview> ProductReviews => Set<ProductReview>();
    public DbSet<CouponUsage> CouponUsages => Set<CouponUsage>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<ProductColor> ProductColors => Set<ProductColor>();
    public DbSet<ProductSize> ProductSizes => Set<ProductSize>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Product>()
            .HasMany(p => p.Images)
            .WithOne(i => i.Product)
            .HasForeignKey(i => i.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Product>()
            .HasMany(p => p.Colors)
            .WithOne(c => c.Product)
            .HasForeignKey(c => c.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Product>()
            .HasMany(p => p.Sizes)
            .WithOne(s => s.Product)
            .HasForeignKey(s => s.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Product>()
            .HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId);

        // SQLite için decimal conversion (Gerekirse)
        modelBuilder.Entity<Product>().Property(p => p.OldPrice).HasConversion<double>();
        modelBuilder.Entity<Product>().Property(p => p.NewPrice).HasConversion<double>();

        modelBuilder.Entity<Order>().Property(o => o.AraToplam).HasConversion<double>();
        modelBuilder.Entity<Order>().Property(o => o.KuponIndirimi).HasConversion<double>();
        modelBuilder.Entity<Order>().Property(o => o.TeslimatUcreti).HasConversion<double>();
        modelBuilder.Entity<Order>().Property(o => o.Toplam).HasConversion<double>();

        modelBuilder.Entity<OrderItem>().Property(o => o.Fiyat).HasConversion<double>();

        // 1. Seed Category
        modelBuilder.Entity<Category>().HasData(
            new Category { Id = 1, Name = "Smartphone", ImageUrl = "categories/categories1.png" },
            new Category { Id = 2, Name = "Watches", ImageUrl = "categories/categories2.png" },
            new Category { Id = 3, Name = "Electronics", ImageUrl = "categories/categories3.png" },
            new Category { Id = 4, Name = "Furnitures", ImageUrl = "categories/categories4.png" },
            new Category { Id = 5, Name = "Collections", ImageUrl = "categories/categories5.png" },
            new Category { Id = 6, Name = "Fashion", ImageUrl = "categories/categories6.png" }
        );

        // 2. Seed Products (JSON'dan gelen veriler)
        modelBuilder.Entity<Product>().HasData(
        new Product
        {
            Id = 1,
            Name = "Analogue Resin Strap",
            OldPrice = 165.0m,
            NewPrice = 108.0m,
            Discount = 22,
            CategoryId = 1,
            Description = "Klasik tasarımı ve dayanıklı reçine kayışıyla günlük kullanım için ideal bir saat kayışı. Su geçirmez yapısı ve ayarlanabilir tokalı sistemiyle her bilek ölçüsüne uyum sağlar. Minimalist estetiği modern gardıroplarla mükemmel uyum içindedir."
        },

        new Product
        {
            Id = 2,
            Name = "Ridley High Waist",
            OldPrice = 208.0m,
            NewPrice = 100.0m,
            Discount = 33,
            CategoryId = 1,
            Description = "Yüksek bel kesimi ve vücudu saran fit yapısıyla Ridley High Waist, şıklığı konforu ile buluşturuyor. %95 pamuk, %5 elastan karışımıyla nefes alabilir bir his sunar. Her vücut tipine uygun tasarımı sayesinde hem günlük hem de özel davetler için tercih edilebilir."
        },

        new Product
        {
            Id = 3,
            Name = "Blush Beanie",
            OldPrice = 165.0m,
            NewPrice = 38.0m,
            Discount = 90,
            CategoryId = 2,
            Description = "Soğuk kış günlerinde başınızı sıcak tutacak Blush Beanie, yumuşak dokulu akrilik iplikten üretilmiştir. Pembe tonlarıyla tatlı ve şık bir görünüm sunar. Unisex tasarımı sayesinde her yaşa ve stile hitap eder."
        },

        new Product
        {
            Id = 4,
            Name = "Mercury Tee",
            OldPrice = 165.0m,
            NewPrice = 48.0m,
            Discount = 40,
            CategoryId = 3,
            Description = "Mercury Tee, %100 organik pamuktan üretilmiş çevre dostu bir günlük t-shirt seçeneğidir. Hafif ve nefes alabilir kumaşı ile yaz aylarının vazgeçilmezi olacak. Sade kesimi ve farklı renk seçenekleriyle her kombine kolayca uyum sağlar."
        },

        new Product
        {
            Id = 5,
            Name = "La Bohème Rose Gold",
            OldPrice = 165.0m,
            NewPrice = 48.0m,
            Discount = 40,
            CategoryId = 4,
            Description = "Bohem ruhunu rose gold detaylarla birleştiren La Bohème, özel anlarınız için tasarlanmış zarif bir aksesuar koleksiyonudur. El yapımı işçiliği ve titiz detaylarıyla göz alıcı bir şıklık sunar. Sevdiklerinize özel bir hediye seçeneği olarak da tercih edilebilir."
        },

        new Product
        {
            Id = 6,
            Name = "Ridley High Waist",
            OldPrice = 208.0m,
            NewPrice = 100.0m,
            Discount = 33,
            CategoryId = 1,
            Description = "Yüksek bel kesimi ve vücudu saran fit yapısıyla Ridley High Waist, şıklığı konforu ile buluşturuyor. Özel dikiş teknolojisi sayesinde uzun süreli kullanımda bile şeklini korur."
        },

        new Product
        {
            Id = 7,
            Name = "Blush Beanie",
            OldPrice = 165.0m,
            NewPrice = 38.0m,
            Discount = 90,
            CategoryId = 2,
            Description = "El örgüsü dokusunu andıran Blush Beanie, kışın en sevilen aksesuar parçalarından biri olmaya aday. Yumuşak iç astarı ile uzun süre konforlu kullanım sağlar. Katlanabilir ağız kısmı istediğiniz uzunlukta kullanmanıza olanak tanır."
        }
        );

        // 3. Seed ProductImages (JSON Thumbs verileri)
        modelBuilder.Entity<ProductImage>().HasData(
            // Product 1
            new ProductImage { Id = 1, Url = "products/product1/1.png", ProductId = 1, IsMain = true },
            new ProductImage { Id = 2, Url = "products/product1/2.png", ProductId = 1, IsMain = false },
            new ProductImage { Id = 3, Url = "products/product1/3.png", ProductId = 1, IsMain = false },
            // Product 2
            new ProductImage { Id = 4, Url = "products/product2/1.png", ProductId = 2, IsMain = true },
            new ProductImage { Id = 5, Url = "products/product2/2.png", ProductId = 2, IsMain = false },
            new ProductImage { Id = 6, Url = "products/product2/3.png", ProductId = 2, IsMain = false },
            // Product 3
            new ProductImage { Id = 7, Url = "products/product3/1.png", ProductId = 3, IsMain = true },
            new ProductImage { Id = 8, Url = "products/product3/2.png", ProductId = 3, IsMain = false },
            new ProductImage { Id = 9, Url = "products/product3/3.png", ProductId = 3, IsMain = false },
            // Product 4
            new ProductImage { Id = 10, Url = "products/product4/1.png", ProductId = 4, IsMain = true },
            new ProductImage { Id = 11, Url = "products/product4/2.png", ProductId = 4, IsMain = false },
            new ProductImage { Id = 12, Url = "products/product4/3.png", ProductId = 4, IsMain = false },
            // Product 5
            new ProductImage { Id = 13, Url = "products/product5/1.png", ProductId = 5, IsMain = true },
            new ProductImage { Id = 14, Url = "products/product5/2.png", ProductId = 5, IsMain = false },
            new ProductImage { Id = 15, Url = "products/product5/3.png", ProductId = 5, IsMain = false },

            // Product 1
            new ProductImage { Id = 16, Url = "products/product1/1.png", ProductId = 6, IsMain = true },
            new ProductImage { Id = 17, Url = "products/product1/2.png", ProductId = 6, IsMain = false },
            new ProductImage { Id = 18, Url = "products/product1/3.png", ProductId = 6, IsMain = false },
            // Product 2
            new ProductImage { Id = 19, Url = "products/product2/1.png", ProductId = 7, IsMain = true },
            new ProductImage { Id = 20, Url = "products/product2/2.png", ProductId = 7, IsMain = false },
            new ProductImage { Id = 21, Url = "products/product2/3.png", ProductId = 7, IsMain = false }
        );

        // Seed ProductColors
        modelBuilder.Entity<ProductColor>().HasData(
            // Product 1
            new ProductColor { Id = 1, Color = "#000000", ProductId = 1 },
            new ProductColor { Id = 2, Color = "#b40606", ProductId = 1 },
            // Product 2
            new ProductColor { Id = 3, Color = "#000000", ProductId = 2 },
            new ProductColor { Id = 4, Color = "#8c0808", ProductId = 2 },
            // Product 3
            new ProductColor { Id = 5, Color = "#bebebe", ProductId = 3 },
            new ProductColor { Id = 6, Color = "#161212", ProductId = 3 },
            // Product 4
            new ProductColor { Id = 7, Color = "#000000", ProductId = 4 },
            new ProductColor { Id = 8, Color = "#d1cbcb", ProductId = 4 },
            // Product 5
            new ProductColor { Id = 9, Color = "#3c4d84", ProductId = 5 },
            new ProductColor { Id = 10, Color = "#707174", ProductId = 5 },
            new ProductColor { Id = 11, Color = "#040506", ProductId = 5 },
            // Product 6
            new ProductColor { Id = 12, Color = "#000000", ProductId = 6 },
            new ProductColor { Id = 13, Color = "#a15555", ProductId = 6 },
            // Product 7
            new ProductColor { Id = 14, Color = "#000000", ProductId = 7 },
            new ProductColor { Id = 15, Color = "#d92a2a", ProductId = 7 },
            new ProductColor { Id = 16, Color = "#878181", ProductId = 7 }
        );

        // Seed ProductSizes
        modelBuilder.Entity<ProductSize>().HasData(
            // Product 1
            new ProductSize { Id = 1, Size = ProductSizeType.XXS, Stock = 2, ProductId = 1 },
            new ProductSize { Id = 2, Size = ProductSizeType.XS, Stock = 5, ProductId = 1 },
            new ProductSize { Id = 3, Size = ProductSizeType.M, Stock = 0, ProductId = 1 },
            new ProductSize { Id = 4, Size = ProductSizeType.S, Stock = 3, ProductId = 1 },
            // Product 2
            new ProductSize { Id = 5, Size = ProductSizeType.XXS, Stock = 1, ProductId = 2 },
            new ProductSize { Id = 6, Size = ProductSizeType.S, Stock = 2, ProductId = 2 },
            new ProductSize { Id = 7, Size = ProductSizeType.L, Stock = 4, ProductId = 2 },
            new ProductSize { Id = 8, Size = ProductSizeType.M, Stock = 2, ProductId = 2 },
            // Product 3
            new ProductSize { Id = 9, Size = ProductSizeType.XS, Stock = 5, ProductId = 3 },
            new ProductSize { Id = 10, Size = ProductSizeType.S, Stock = 4, ProductId = 3 },
            new ProductSize { Id = 11, Size = ProductSizeType.M, Stock = 0, ProductId = 3 },
            // Product 4
            new ProductSize { Id = 12, Size = ProductSizeType.XS, Stock = 2, ProductId = 4 },
            new ProductSize { Id = 13, Size = ProductSizeType.S, Stock = 0, ProductId = 4 },
            new ProductSize { Id = 14, Size = ProductSizeType.M, Stock = 3, ProductId = 4 },
            // Product 5
            new ProductSize { Id = 15, Size = ProductSizeType.M, Stock = 2, ProductId = 5 },
            new ProductSize { Id = 16, Size = ProductSizeType.XL, Stock = 3, ProductId = 5 },
            new ProductSize { Id = 17, Size = ProductSizeType.XXL, Stock = 4, ProductId = 5 },
            // Product 6
            new ProductSize { Id = 18, Size = ProductSizeType.XS, Stock = 4, ProductId = 6 },
            new ProductSize { Id = 19, Size = ProductSizeType.XXS, Stock = 5, ProductId = 6 },
            new ProductSize { Id = 20, Size = ProductSizeType.S, Stock = 2, ProductId = 6 },
            new ProductSize { Id = 21, Size = ProductSizeType.M, Stock = 3, ProductId = 6 },
            // Product 7
            new ProductSize { Id = 22, Size = ProductSizeType.S, Stock = 5, ProductId = 7 },
            new ProductSize { Id = 23, Size = ProductSizeType.M, Stock = 3, ProductId = 7 },
            new ProductSize { Id = 24, Size = ProductSizeType.XL, Stock = 2, ProductId = 7 },
            new ProductSize { Id = 25, Size = ProductSizeType.L, Stock = 4, ProductId = 7 }
        );

        // Seed Slider
        modelBuilder.Entity<Slider>().HasData(
            new Slider { Id = 1, Index = 0, Resim = "slider/slider1.jpg", Aktif = true },
            new Slider { Id = 2, Index = 1, Resim = "slider/slider2.jpg", Aktif = true },
            new Slider { Id = 3, Index = 2, Resim = "slider/slider3.jpg", Aktif = true }
        );

        modelBuilder.Entity<Campaign>().HasData(
            new Campaign { Id = 1, Index = 0, Title = "Fashion Month Ready in Capital Shop", Description = "Lorem ipsum dolor sit amet consectetur adipiscing elit dolor", CategoryId = 6, ImageUrl = "campaigns/banner1.png" },
            new Campaign { Id = 2, Index = 1, Title = "Fashion Month Ready in Capital Shop", Description = "Lorem ipsum dolor sit amet consectetur adipiscing elit dolor", CategoryId = 5, ImageUrl = "campaigns/banner2.png" },
            new Campaign { Id = 3, Index = 2, Title = "Fashion Month Ready in Capital Shop", Description = "Lorem ipsum dolor sit amet consectetur adipiscing elit dolor", CategoryId = 6, ImageUrl = "campaigns/banner3.png" },
            new Campaign { Id = 4, Index = 3, Title = "Fashion Month Ready in Capital Shop", Description = "Lorem ipsum dolor sit amet consectetur adipiscing elit dolor", CategoryId = 5, ImageUrl = "campaigns/banner4.png" }
        );


        modelBuilder.Entity<Blog>().HasData(
            new Blog
            {
                Id = 1,
                Title = "The Best Products That Shape Fashion",
                Description = "Fashion dünyasında öne çıkan ürünleri keşfedin.",
                Img = "blogs/blog1.jpg",
                CreatedDate = new DateTime(2026, 05, 07),
                UpdatedDate = new DateTime(2026, 05, 07)
            },
            new Blog
            {
                Id = 2,
                Title = "Modern Street Style Trends",
                Description = "Sokak modasında yeni trendler ve kombin önerileri.",
                Img = "blogs/blog2.jpg",
                CreatedDate = new DateTime(2026, 05, 07),
                UpdatedDate = new DateTime(2026, 05, 07)
            },
            new Blog
            {
                Id = 3,
                Title = "Luxury Brands That Define Elegance",
                Description = "Lüks markaların stil dünyasına etkisi.",
                Img = "blogs/blog3.jpg",
                CreatedDate = new DateTime(2026, 05, 07),
                UpdatedDate = new DateTime(2026, 05, 07)
            }
        );


        modelBuilder.Entity<Coupon>().HasData(
            new Coupon { Id = 1, Code = "HOSGELDIN10", DiscountPercent = 10, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Coupon { Id = 2, Code = "YAZA20", DiscountPercent = 20, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        );
    }
}