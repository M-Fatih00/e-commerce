using API.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/demo")]
[AllowAnonymous]
public class DemoController : ControllerBase
{
    private readonly IConfiguration _config;

    public DemoController(IConfiguration config)
    {
        _config = config;
    }

    [HttpGet("accounts")]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public ActionResult<IEnumerable<DemoAccountDTO>> GetAccounts()
    {
        var accounts = new List<DemoAccountDTO>();

        if (!_config.GetValue("Demo:Enabled", false))
            return Ok(accounts);

        AddAccount(accounts, "Admin", "admin", _config["Seed:AdminPassword"]);
        AddAccount(accounts, "Customer", "customer", _config["Seed:CustomerPassword"]);

        return Ok(accounts);
    }

    private static void AddAccount(List<DemoAccountDTO> accounts, string role, string userName, string? password)
    {
        if (!string.IsNullOrWhiteSpace(password))
            accounts.Add(new DemoAccountDTO(role, userName, password));
    }
}