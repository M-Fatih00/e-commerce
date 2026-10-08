using API.Entity;
using Microsoft.AspNetCore.Identity;

namespace API.Data;

public static class SeedDatabase
{
    public static async Task SeedRolesAndUsers(UserManager<AppUser> userManager, RoleManager<AppRole> roleManager, IConfiguration config)
    {
        string[] roles = { "Admin", "Customer" };
        foreach (var roleName in roles)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
                await roleManager.CreateAsync(new AppRole { Name = roleName });
        }

        var demoEnabled = config.GetValue("Demo:Enabled", false);

        await EnsureUser(userManager, "admin", "admin@example.com", "Admin User", "Admin",
            config["Seed:AdminPassword"], "Seed:AdminPassword", demoEnabled);

        await EnsureUser(userManager, "customer", "customer@example.com", "Customer User", "Customer",
            config["Seed:CustomerPassword"], "Seed:CustomerPassword", demoEnabled);
    }

    private static async Task EnsureUser(UserManager<AppUser> userManager, string userName, string email,
        string fullName, string role, string? password, string passwordKey, bool demoEnabled)
    {
        var user = await userManager.FindByNameAsync(userName);

        if (user == null)
        {
            if (string.IsNullOrWhiteSpace(password))
                throw new InvalidOperationException($"{passwordKey} tanımlı değil.");

            user = new AppUser { FullName = fullName, UserName = userName, Email = email };

            var createResult = await userManager.CreateAsync(user, password);
            if (!createResult.Succeeded)
                throw new InvalidOperationException($"{userName} oluşturulamadı: {string.Join(" ", createResult.Errors.Select(e => e.Description))}");

            var roleResult = await userManager.AddToRoleAsync(user, role);
            if (!roleResult.Succeeded)
                throw new InvalidOperationException($"{userName} için rol atanamadı.");
        }

        if (user.LockoutEnabled == demoEnabled)
            await userManager.SetLockoutEnabledAsync(user, !demoEnabled);
    }
}