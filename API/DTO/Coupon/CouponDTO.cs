namespace API.DTO;
 
public class CouponDTO
{
    public int Id { get; set; }
    public string Code { get; set; } = null!;
    public int DiscountPercent { get; set; }
}
 
public class CreateCouponDTO
{
    public string Code { get; set; } = null!;
    public int DiscountPercent { get; set; }
}
 
public class ApplyCouponDTO
{
    public string Code { get; set; } = null!;
}
 
public class ApplyCouponResultDTO
{
    public string Code { get; set; } = null!;
    public int DiscountPercent { get; set; }
    public decimal KuponIndirimi { get; set; }
    public decimal YeniToplam { get; set; }
}
 