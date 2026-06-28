using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using API.Entity;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace API.Services;

public class TokenService
{
    private readonly UserManager<AppUser> _userManager;
    private readonly IConfiguration _config;

    public TokenService(UserManager<AppUser> userManager, IConfiguration config)
    {
        _userManager = userManager;
        _config = config;
    }


    public async Task<string> GenerateToken(AppUser user, bool rememberMe)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Email, user.Email!),
            new Claim(ClaimTypes.NameIdentifier, user.Id!),
            new Claim(ClaimTypes.Name, user.UserName!),
        };

        var roles = await _userManager.GetRolesAsync(user);

        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_config["AppSettings:Secret"]!));

        var tokenSettings = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),

            Expires = rememberMe
            ? DateTime.UtcNow.AddDays(30)
            : DateTime.UtcNow.AddHours(2),

            SigningCredentials = new SigningCredentials(
            key,
            SecurityAlgorithms.HmacSha256Signature
        ),
            Issuer = "fatihcanibek.com",
            Audience = "firmaAdı"
        };

        var token = tokenHandler.CreateToken(tokenSettings);
        Console.WriteLine(token);
        return tokenHandler.WriteToken(token);
    }

}