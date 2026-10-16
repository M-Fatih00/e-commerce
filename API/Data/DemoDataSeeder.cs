using API.Entity;
using API.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public static class DemoDataSeeder
{
    public const string PaymentPrefix = "demo_";

    private const string Paid = "Ödendi";
    private const string Shipped = "Kargoda";
    private const string Delivered = "Teslim Edildi";
    private const string Cancelled = "İptal";
    private const int OrderCount = 18;

    private static readonly (string UserName, string FullName, string City, string PostalCode)[] Shoppers =
    {
        ("ayse.kaya", "Ayşe Kaya", "İstanbul", "34710"),
        ("mehmet.demir", "Mehmet Demir", "Ankara", "06420"),
        ("zeynep.sahin", "Zeynep Şahin", "İzmir", "35220"),
        ("emre.celik", "Emre Çelik", "Bursa", "16110"),
        ("elif.yildiz", "Elif Yıldız", "Antalya", "07100")
    };

    private static readonly string[] Streets =
    {
        "Atatürk Cd. No:12 D:4",
        "Cumhuriyet Mah. Gül Sk. No:7",
        "İstiklal Cd. No:45 D:2",
        "Bağdat Cd. No:210 D:9",
        "Kordon Boyu No:18 D:3"
    };

    private static readonly string[] Notes =
    {
        "",
        "",
        "",
        "Kapıya bırakabilirsiniz.",
        "Hediye paketi yapılabilir mi?",
        "Mesai saatlerinde teslim edilirse sevinirim."
    };

    private static readonly (int Rating, string Text)[] ReviewTemplates =
    {
        (5, "Kumaşı çok kaliteli, kalıbı tam beklediğim gibi. Kesinlikle tavsiye ederim."),
        (5, "Kargo hızlıydı, ürün fotoğraftakiyle birebir aynı."),
        (4, "Güzel ürün, bedeni biraz büyük geldi; bir beden küçük alınabilir."),
        (4, "Fiyatına göre gayet başarılı, rengi canlı."),
        (5, "İkinci kez alıyorum, yıkamadan sonra da formunu koruyor."),
        (3, "Ürün güzel ama paketleme daha özenli olabilirdi."),
        (4, "Rahat ve şık, günlük kullanım için ideal.")
    };

    public static bool IsDemoPayment(string? id) =>
        id?.StartsWith(PaymentPrefix, StringComparison.Ordinal) == true;

    public static async Task SeedAsync(DataContext context, UserManager<AppUser> userManager, IConfiguration config)
    {
        if (!config.GetValue("Demo:Enabled", false) || await context.Orders.AnyAsync())
            return;

        var products = await context.Products
            .AsNoTracking()
            .Include(p => p.Images)
            .Include(p => p.Sizes)
            .AsSplitQuery()
            .OrderBy(p => p.Id)
            .ToListAsync();

        if (products.Count == 0)
            return;

        var coupons = await context.Coupons.AsNoTracking().OrderBy(c => c.Id).ToListAsync();
        var prefix = config["Order:NumberPrefix"] ?? "ES";
        var random = new Random(2026);
        var now = DateTime.Now;

        var buyers = new List<(AppUser User, string City, string PostalCode, bool IsShopper)>();

        var customer = await userManager.FindByNameAsync("customer");
        if (customer != null)
            buyers.Add((customer, "Ankara", "06690", false));

        foreach (var shopper in Shoppers)
        {
            var user = await EnsureShopper(userManager, shopper.UserName, shopper.FullName);
            buyers.Add((user, shopper.City, shopper.PostalCode, true));
        }

        var usedNumbers = new HashSet<string>();
        var orders = new List<(Order Order, bool ByShopper)>();

        for (var i = 0; i < OrderCount; i++)
        {
            var buyer = buyers[i % buyers.Count];

            var date = now.AddDays(-(i * 9 + random.Next(0, 5))).Date
                .AddHours(random.Next(9, 23))
                .AddMinutes(random.Next(0, 60));
            if (date > now)
                date = now.AddMinutes(-random.Next(30, 240));

            var (status, isPaid) = i switch
            {
                4 or 11 => (Cancelled, false),
                7 or 14 => (Cancelled, true),
                < 3 => (Paid, true),
                < 6 => (Shipped, true),
                _ => (Delivered, true)
            };

            var items = new List<OrderItem>();
            var listTotal = 0m;
            var saleTotal = 0m;

            foreach (var product in products.OrderBy(_ => random.Next()).Take(random.Next(1, 4)))
            {
                var quantity = random.Next(1, 3);
                var unitPrice = Cart.UnitPrice(product);
                var size = product.Sizes.Count > 0
                    ? product.Sizes[random.Next(product.Sizes.Count)].Size.ToString()
                    : null;

                items.Add(new OrderItem
                {
                    UrunId = product.Id,
                    UrunAdi = product.Name,
                    UrunResmi = product.Images.FirstOrDefault(x => x.IsMain)?.Url
                        ?? product.Images.FirstOrDefault()?.Url
                        ?? "",
                    Fiyat = unitPrice,
                    Miktar = quantity,
                    Beden = size
                });

                listTotal += Math.Max(product.OldPrice, unitPrice) * quantity;
                saleTotal += unitPrice * quantity;
            }

            var coupon = coupons.Count > 0 && i % 4 == 2 ? coupons[i % coupons.Count] : null;
            var couponDiscount = coupon == null
                ? 0m
                : Math.Round(saleTotal * coupon.DiscountPercent / 100, 2, MidpointRounding.AwayFromZero);
            var shipping = ShippingRules.Calculate(saleTotal, random.Next(0, 4) == 0);

            string number;
            do number = OrderNumberGenerator.Generate(prefix);
            while (!usedNumbers.Add(number));

            var order = new Order
            {
                OrderNumber = number,
                SiparisTarihi = date,
                CustomerId = buyer.User.Id,
                Username = buyer.User.UserName!,
                AdSoyad = buyer.User.FullName,
                Telefon = $"53{random.Next(10000000, 99999999)}",
                Sehir = buyer.City,
                PostaKodu = buyer.PostalCode,
                AdresSatiri = Streets[random.Next(Streets.Length)],
                SiparisNotu = Notes[random.Next(Notes.Length)],
                AraToplam = listTotal,
                KuponKodu = coupon?.Code,
                KuponIndirimi = couponDiscount,
                TeslimatUcreti = shipping,
                Toplam = saleTotal - couponDiscount + shipping,
                Durum = status,
                IyzicoToken = $"{PaymentPrefix}cs_{Guid.NewGuid():N}",
                IyzicoPaymentId = isPaid ? $"{PaymentPrefix}pi_{Guid.NewGuid():N}" : null,
                OrderItems = items
            };

            orders.Add((order, buyer.IsShopper));
        }

        context.Orders.AddRange(orders.Select(o => o.Order));
        await context.SaveChangesAsync();

        await SeedReviews(context, orders, random, now);
    }

    private static async Task SeedReviews(DataContext context, List<(Order Order, bool ByShopper)> orders, Random random, DateTime now)
    {
        var reviews = context.Set<ProductReview>();

        var existing = (await reviews.Select(r => new { r.UserId, r.ProductId }).ToListAsync())
            .Select(r => $"{r.UserId}:{r.ProductId}")
            .ToHashSet();

        foreach (var (order, byShopper) in orders)
        {
            if (!byShopper || order.Durum != Delivered || order.CustomerId == null)
                continue;

            foreach (var item in order.OrderItems.Take(2))
            {
                if (!existing.Add($"{order.CustomerId}:{item.UrunId}"))
                    continue;

                var template = ReviewTemplates[random.Next(ReviewTemplates.Length)];
                var createdAt = order.SiparisTarihi.AddDays(random.Next(3, 10));

                reviews.Add(new ProductReview
                {
                    ProductId = item.UrunId,
                    UserId = order.CustomerId,
                    Rating = template.Rating,
                    Text = template.Text,
                    CreatedDate = createdAt > now ? now : createdAt
                });
            }
        }

        await context.SaveChangesAsync();
    }

    private static async Task<AppUser> EnsureShopper(UserManager<AppUser> userManager, string userName, string fullName)
    {
        var user = await userManager.FindByNameAsync(userName);
        if (user != null)
            return user;

        user = new AppUser
        {
            UserName = userName,
            Email = $"{userName}@example.com",
            FullName = fullName
        };

        var result = await userManager.CreateAsync(user, $"{Guid.NewGuid():N}Aa1!");
        if (!result.Succeeded)
            throw new InvalidOperationException(
                $"{userName} oluşturulamadı: {string.Join(" ", result.Errors.Select(e => e.Description))}");

        await userManager.AddToRoleAsync(user, "Customer");
        return user;
    }
}