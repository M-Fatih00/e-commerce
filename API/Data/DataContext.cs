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
    public DbSet<StoreContactInfo> ContactInfo => Set<StoreContactInfo>();


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

        modelBuilder.Entity<Order>().HasIndex(o => o.OrderNumber).IsUnique();

        // 1. Seed Category
        modelBuilder.Entity<Category>().HasData(
            new Category { Id = 1, Name = "Akıllı Telefon", ImageUrl = "categories/categories1.png" },
            new Category { Id = 2, Name = "Saatler", ImageUrl = "categories/categories2.png" },
            new Category { Id = 3, Name = "Elektronik", ImageUrl = "categories/categories3.png" },
            new Category { Id = 4, Name = "Mobilya", ImageUrl = "categories/categories4.png" },
            new Category { Id = 5, Name = "Koleksiyonlar", ImageUrl = "categories/categories5.png" },
            new Category { Id = 6, Name = "Moda", ImageUrl = "categories/categories6.png" }
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
            new Slider { Id = 1, Index = 0, Resim = "slider/slider1.jpg", Aktif = true, Baslik = "YENİ SEZON", AltBaslik = "Yeni sezon ürünlerini keşfedin", ButonMetni = "Alışverişe Başla", ButonLinki = "/shop" },
            new Slider { Id = 2, Index = 1, Resim = "slider/slider2.jpg", Aktif = true, Baslik = "HAFTANIN FAVORİLERİ", AltBaslik = "En çok tercih edilen parçalar", ButonMetni = "İncele", ButonLinki = "/shop?category=6" },
            new Slider { Id = 3, Index = 2, Resim = "slider/slider3.jpg", Aktif = true, Baslik = "FIRSAT KÖŞESİ", AltBaslik = "Seçili ürünlerde kaçırılmayacak fiyatlar", ButonMetni = "Fırsatları Gör", ButonLinki = "/shop" }
        );

        modelBuilder.Entity<Campaign>().HasData(
            new Campaign { Id = 1, Index = 0, Title = "Yeni Sezon Koleksiyonu", Description = "Sezonun en çok konuşulan parçaları şimdi mağazada.", CategoryId = 6, ImageUrl = "campaigns/banner1.png" },
            new Campaign { Id = 2, Index = 1, Title = "Haftanın Favorileri", Description = "En çok tercih edilen ürünleri keşfet, tarzını tamamla.", CategoryId = 5, ImageUrl = "campaigns/banner2.png" },
            new Campaign { Id = 3, Index = 2, Title = "Zamansız Klasikler", Description = "Her dolapta olması gereken, uzun ömürlü parçalar.", CategoryId = 6, ImageUrl = "campaigns/banner3.png" },
            new Campaign { Id = 4, Index = 3, Title = "Fırsat Köşesi", Description = "Seçili ürünlerde kaçırılmayacak fiyatlar.", CategoryId = 5, ImageUrl = "campaigns/banner4.png" }
        );


        modelBuilder.Entity<Blog>().HasData(
    new Blog
    {
        Id = 1,
        Title = "Modayı Şekillendiren Parçalar",
        Img = "blogs/blog1.jpg",
        CreatedDate = new DateTime(2026, 5, 7),
        UpdatedDate = new DateTime(2026, 5, 7),
        Description = """
                    <p>Her sezon onlarca yeni trend gelip geçiyor, ama bazı parçalar dolabımızda yıllarca kalıyor. Bu parçaları özel kılan şey moda olmaları değil; doğru kesim, iyi kumaş ve her kombine uyum sağlayabilmeleri. Bu yazıda, gardırobunuzun temelini oluşturacak parçaları ve onları nasıl seçeceğinizi anlatıyoruz.</p>
                    <h2>1. İyi kesimli bir ceket</h2>
                    <p>Omuz çizgisi tam oturan bir ceket, en sade kombini bile toparlar. Satın alırken önce omuzlara bakın: dikiş, omuz kemiğinizin bittiği noktada olmalı. Kol boyu bileği hafifçe geçmeli, gömlek manşeti 1-2 cm görünebilmeli.</p>
                    <h2>2. Yüksek bel pantolon</h2>
                    <p>Yüksek bel kesim bacakları daha uzun gösterir ve hem tişörtle hem de gömlekle rahatça kombinlenir. <strong>Pamuk ağırlıklı, az miktarda elastan içeren</strong> kumaşlar gün boyu formunu korur ve hareket rahatlığı sağlar.</p>
                    <h2>3. Sade, kaliteli bir tişört</h2>
                    <p>Beyaz, siyah ya da gri bir tişört; ceketin altında, pantolonla ya da etekle aynı başarıyı gösterir. Kumaşın kalınlığına dikkat edin: biraz daha kalın gramajlı tişörtler yıkamadan sonra şeklini daha uzun korur.</p>
                    <h2>4. Kombini tamamlayan aksesuarlar</h2>
                    <p>Bir saat, ince bir kemer ya da sezona uygun bir bere; aynı kıyafeti bambaşka bir havaya sokabilir. Aksesuarda kural basit: kombinde tek bir dikkat çekici parça yeterli.</p>
                    <blockquote>Stil, ne kadar çok parçanız olduğuyla değil, elinizdeki parçaları ne kadar iyi kullandığınızla ilgilidir.</blockquote>
                    <h3>Alışverişten önce kısa bir kontrol listesi</h3>
                    <ul>
                        <li>Bu parçayla dolabımdaki en az üç ürünü kombinleyebilir miyim?</li>
                        <li>Kumaş içeriği ve bakım talimatları bana uygun mu?</li>
                        <li>Kesim vücuduma oturuyor mu, yoksa terziye mi ihtiyaç var?</li>
                    </ul>
                    <p>Az ama doğru seçilmiş parçalarla kurulan bir gardırop, hem zamandan hem bütçeden tasarruf ettirir. Yeni sezon ürünlerimize göz atarken bu listeyi aklınızda tutmanızı öneririz.</p>
                    """
    },
    new Blog
    {
        Id = 2,
        Title = "Modern Sokak Stili Trendleri",
        Img = "blogs/blog2.jpg",
        CreatedDate = new DateTime(2026, 6, 18),
        UpdatedDate = new DateTime(2026, 6, 18),
        Description = """
                    <p>Sokak stili artık podyumlardan ilham almıyor; tam tersine, podyumlar sokaktan ilham alıyor. Rahatlık ve kişisel ifade bu akımın merkezinde. Bu sezon öne çıkan sokak stili trendlerini ve onları günlük hayata nasıl taşıyabileceğinizi derledik.</p>
                    <h2>Bol kesimler geri döndü</h2>
                    <p>Geniş paça pantolonlar, omuzdan düşük tişörtler ve oversize ceketler sezonun en çok tercih edilen parçaları arasında. Bol bir parçayı dengelemenin en kolay yolu, kombinin geri kalanını daha oturan seçmek: <em>oversize bir ceketin altına düz bir pantolon</em> gibi.</p>
                    <h2>Katmanlı giyim</h2>
                    <p>İnce bir tişört, üzerine açık gömlek, en üstte hafif bir ceket… Katmanlı giyim hem mevsim geçişlerinde pratik hem de kombine derinlik katıyor. Katmanlarda renkleri aynı ton ailesinden seçmek, görünümün dağınık durmasını engeller.</p>
                    <h2>Nötr renkler, tek bir vurgu</h2>
                    <p>Sezonun renk paletine bej, haki, gri ve siyah hâkim. Bu sakin tabanın üzerine tek bir canlı renk, örneğin kırmızı bir bere ya da çanta, eklemek kombini bir anda öne çıkarıyor.</p>
                    <blockquote>Sokak stilinin tek kuralı var: kendiniz gibi hissetmek.</blockquote>
                    <h3>Bu sezon denemeniz gereken üç kombin</h3>
                    <ul>
                        <li><strong>Günlük:</strong> beyaz tişört, yüksek bel kot, spor ayakkabı ve ince bir zincir kolye</li>
                        <li><strong>Hafta sonu:</strong> oversize sweatshirt, kargo pantolon ve renkli bir bere</li>
                        <li><strong>Akşam:</strong> siyah boğazlı kazak, düz kesim pantolon ve deri ceket</li>
                    </ul>
                    <p>Trendleri birebir kopyalamak yerine, size en çok uyan bir-iki fikri seçip kendi tarzınıza eklemeyi deneyin. Sokak stili zaten tam olarak bu: kişisel yorum.</p>
                    """
    },
    new Blog
    {
        Id = 3,
        Title = "Zarafetin Tanımı: Lüks Markalar",
        Img = "blogs/blog3.jpg",
        CreatedDate = new DateTime(2026, 8, 3),
        UpdatedDate = new DateTime(2026, 8, 3),
        Description = """
                    <p>Lüks denildiğinde akla ilk gelen yüksek fiyatlar olsa da, köklü moda evlerini gerçekten ayıran şey fiyat değil; işçilik, malzeme ve zamansız tasarım anlayışı. Peki bu anlayışı kendi gardırobumuza nasıl taşıyabiliriz?</p>
                    <h2>İşçilik ayrıntıda gizlidir</h2>
                    <p>Düzgün ve sık dikişler, birbirine denk gelen desenler, sağlam düğmeler ve temiz iç astarlar… İyi bir ürünü tanımak için etiketine değil, iç tarafına bakın. Ayrıntılara gösterilen özen, ürünün yıllarca kullanılıp kullanılamayacağını belirler.</p>
                    <h2>Malzeme kaliteyi taşır</h2>
                    <p>Yün, ipek, keten ve kaliteli pamuk gibi doğal lifler hem daha iyi nefes alır hem de zamanla daha güzel yaşlanır. Etikette <strong>kumaş içeriğini</strong> okumak, kaliteli bir alışverişin ilk adımıdır.</p>
                    <h2>Zamansız tasarım</h2>
                    <p>Lüks markaların en bilinen parçaları genellikle en sade olanlarıdır: iyi kesimli bir trençkot, klasik bir saat, yalın bir çanta. Bu parçalar bir sezonun trendine değil, yılların birikimine dayanır.</p>
                    <blockquote>Gerçek zarafet dikkat çekmeye çalışmaz; fark edilir.</blockquote>
                    <h3>Lüks hissini bütçeyi zorlamadan yakalamak</h3>
                    <ul>
                        <li>Çok sayıda trend parça yerine, az sayıda kaliteli temel parçaya yatırım yapın.</li>
                        <li>Renk paletinizi sınırlı tutun; birbirine uyan parçalar daha şık görünür.</li>
                        <li>Kıyafetlerinizin bakımını ihmal etmeyin: doğru yıkama ve ütü, bir parçanın ömrünü ikiye katlar.</li>
                    </ul>
                    <p>Zarafet bir marka adı değil, bir tercih biçimidir. Aldığınız her parçanın uzun süre sizinle kalacağını düşünerek seçim yaptığınızda, gardırobunuz da zamanla bu anlayışı yansıtacaktır.</p>
                    """
    }
);
        modelBuilder.Entity<Coupon>().HasData(
            new Coupon { Id = 1, Code = "HOSGELDIN10", DiscountPercent = 10, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new Coupon { Id = 2, Code = "YAZA20", DiscountPercent = 20, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        );

        modelBuilder.Entity<StoreContactInfo>().HasData(new StoreContactInfo
        {
            Id = 1,
            Email = "destek@example.com",
            Address = "İstanbul, Türkiye",
            WorkingHours = "Hafta içi 09:00 – 18:00\nHafta sonu kapalı",
            UpdatedAt = new DateTime(2026, 1, 1)
        });
    }
}