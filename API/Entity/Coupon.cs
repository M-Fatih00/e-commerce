namespace API.Entity;
 
public class Coupon
{
    public int Id { get; set; }
    public string Code { get; set; } = null!;
    public int DiscountPercent { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public List<CouponUsage> Usages { get; set; } = new();
}

public class CouponUsage
{
    public int Id { get; set; }
    public int CouponId { get; set; }
    public Coupon Coupon { get; set; } = null!;
    public string UserId { get; set; } = null!;
    public DateTime UsedAt { get; set; } = DateTime.UtcNow;
}