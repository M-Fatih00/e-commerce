using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Logging;

namespace API.Tests.Integration;

public class ApiFactory : WebApplicationFactory<Program>
{
    public const string AdminPassword = "admin-test-pass";
    public const string CustomerPassword = "customer-test-pass";

    private readonly string _dbPath = Path.Combine(Path.GetTempPath(), $"ecommerce-test-{Guid.NewGuid():N}.db");

    public ApiFactory()
    {
        Environment.SetEnvironmentVariable("ConnectionStrings__defaultConnection", $"Data Source={_dbPath}");
        Environment.SetEnvironmentVariable("AppSettings__Secret", "test-only-secret-key-with-at-least-32-chars");
        Environment.SetEnvironmentVariable("Stripe__SecretKey", "sk_test_not_a_real_key");
        Environment.SetEnvironmentVariable("Jwt__Issuer", "test-issuer");
        Environment.SetEnvironmentVariable("Jwt__Audience", "test-audience");
        Environment.SetEnvironmentVariable("Seed__AdminPassword", AdminPassword);
        Environment.SetEnvironmentVariable("Seed__CustomerPassword", CustomerPassword);
        Environment.SetEnvironmentVariable("Demo__Enabled", "true");
        Environment.SetEnvironmentVariable("RateLimit__Enabled", "false");
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureLogging(logging => logging.SetMinimumLevel(LogLevel.Warning));
    }

    public async Task<HttpClient> CreateClientAsync(string? userName = null, string? password = null)
    {
        var client = CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost"),
            AllowAutoRedirect = false
        });

        if (userName != null)
        {
            var response = await client.PostAsJsonAsync("api/account/login", new { userName, password, rememberMe = false });
            response.EnsureSuccessStatusCode();
        }

        return client;
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        SqliteConnection.ClearAllPools();

        foreach (var path in new[] { _dbPath, $"{_dbPath}-shm", $"{_dbPath}-wal" })
        {
            if (File.Exists(path)) File.Delete(path);
        }
    }
}
