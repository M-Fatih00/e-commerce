using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace API.Tests.Integration;

public class ApiSecurityTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;

    public ApiSecurityTests(ApiFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task PublicSliders_AreAvailableWithoutLogin()
    {
        var client = await _factory.CreateClientAsync();

        var response = await client.GetAsync("api/sliders");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetUser_ReturnsUnauthorized_WhenNotLoggedIn()
    {
        var client = await _factory.CreateClientAsync();

        var response = await client.GetAsync("api/account/getUser");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task AdminEndpoint_RequiresLogin()
    {
        var client = await _factory.CreateClientAsync();

        var response = await client.GetAsync("api/sliders/all-sliders");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task AdminEndpoint_RejectsCustomer()
    {
        var client = await _factory.CreateClientAsync("customer", ApiFactory.CustomerPassword);

        var response = await client.GetAsync("api/sliders/all-sliders");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task AdminEndpoint_AllowsAdmin()
    {
        var client = await _factory.CreateClientAsync("admin", ApiFactory.AdminPassword);

        var response = await client.GetAsync("api/sliders/all-sliders");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task DeleteWithoutLogin_IsRejectedBeforeDemoCheck()
    {
        var client = await _factory.CreateClientAsync();

        var response = await client.DeleteAsync("api/sliders/1");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task DemoMode_BlocksAdminWriteOperations()
    {
        var client = await _factory.CreateClientAsync("admin", ApiFactory.AdminPassword);

        var response = await client.DeleteAsync("api/sliders/1");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(body.GetProperty("demo").GetBoolean());

        var sliders = await client.GetFromJsonAsync<JsonElement>("api/sliders/all-sliders");
        Assert.Contains(sliders.EnumerateArray(), s => s.GetProperty("id").GetInt32() == 1);
    }

    [Fact]
    public async Task DemoAccounts_AreListedInDemoMode()
    {
        var client = await _factory.CreateClientAsync();

        var accounts = await client.GetFromJsonAsync<JsonElement>("api/demo/accounts");

        Assert.Equal(2, accounts.GetArrayLength());
    }
}
