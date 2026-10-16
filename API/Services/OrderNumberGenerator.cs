using System.Security.Cryptography;

namespace API.Services;

public static class OrderNumberGenerator
{
    private const string Alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    public static string Generate(string prefix) =>
        $"{prefix}-{RandomNumberGenerator.GetString(Alphabet, 6)}";
}