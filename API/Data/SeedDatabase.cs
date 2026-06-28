using API.Entity;
using Microsoft.AspNetCore.Identity;

namespace API.Data;

public static class SeedDatabase
{
    public static async Task SeedRolesAndUsers(UserManager<AppUser> userManager, RoleManager<AppRole> roleManager)
    {
        // Roller
        string[] roles = { "Admin", "Customer" };
        foreach (var roleName in roles)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new AppRole { Name = roleName });
            }
        }

        // Admin kullanıcısı
        if (await userManager.FindByEmailAsync("admin@gmail.com") == null)
        {
            var adminUser = new AppUser
            {
                FullName = "Admin User",
                UserName = "admin",
                Email = "admin@gmail.com",
            };

            await userManager.CreateAsync(adminUser, "123456");
            await userManager.AddToRoleAsync(adminUser, "Admin");
        }

        // Customer kullanıcısı
        if (await userManager.FindByEmailAsync("customer@gmail.com") == null)
        {
            var customerUser = new AppUser
            {
                FullName = "Customer User",
                UserName = "customer",
                Email = "customer@gmail.com",
            };

            await userManager.CreateAsync(customerUser, "123456");
            await userManager.AddToRoleAsync(customerUser, "Customer");
        }
    }
}