using Microsoft.AspNetCore.Identity;

namespace API.Entity;

public class AppUser : IdentityUser
{
    public string FullName { get; set; } = null!;
    public string? Avatar { get; set; }
}