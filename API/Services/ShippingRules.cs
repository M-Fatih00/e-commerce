namespace API.Services;

public static class ShippingRules
{
    public const decimal FreeShippingThreshold = 1000m;
    public const decimal StandardFee = 29.99m;
    public const decimal ExpressFee = 150m;

    public static decimal Calculate(decimal total, bool express) =>
        express ? ExpressFee : total >= FreeShippingThreshold ? 0m : StandardFee;
}