using System.Security.Cryptography;

namespace API.Services;

public static class OrderNumberGenerator
{
    public static string Generate()
    {
        var first = RandomNumberGenerator.GetInt32(1, 10);
        var rest = RandomNumberGenerator.GetInt32(0, 1_000_000_000);
        return $"{first}{rest:D9}";
    }
}