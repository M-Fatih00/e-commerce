using System.Security.Claims;
using API.Data;
using API.DTO;
using API.Entity;
using API.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private static readonly HashSet<string> AllowedRoles = new() { "Admin", "Customer" };

    private readonly UserManager<AppUser> _userManager;
    private readonly SignInManager<AppUser> _signInManager;
    private readonly DataContext _context;

    public UsersController(UserManager<AppUser> userManager, SignInManager<AppUser> signInManager, DataContext context)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _userManager.Users
            .AsNoTracking()
            .OrderBy(u => u.UserName)
            .Select(u => new { u.Id, u.UserName, u.Email, u.FullName, u.Avatar })
            .ToListAsync();

        var userRoles = await (
            from ur in _context.UserRoles
            join r in _context.Roles on ur.RoleId equals r.Id
            select new { ur.UserId, r.Name }
        ).ToListAsync();

        var rolesByUser = userRoles
            .GroupBy(x => x.UserId)
            .ToDictionary(g => g.Key, g => g.Select(x => x.Name!).ToList());

        var result = users.Select(u => new
        {
            u.Id,
            u.UserName,
            u.Email,
            u.FullName,
            u.Avatar,
            Roles = rolesByUser.GetValueOrDefault(u.Id) ?? new List<string>()
        });

        return Ok(result);
    }

    [HttpPost("{id}/roles")]
    [DemoDisabled]
    public async Task<IActionResult> AddRole(string id, [FromBody] RoleChangeDTO dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (!AllowedRoles.Contains(dto.Role))
            return BadRequest(new { message = "Geçersiz rol." });

        var passwordError = await VerifyAdminPassword(dto.Password);
        if (passwordError != null) return passwordError;

        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            return NotFound(new { message = "Kullanıcı bulunamadı." });

        if (await _userManager.IsInRoleAsync(user, dto.Role))
            return BadRequest(new { message = "Kullanıcı zaten bu role sahip." });

        var result = await _userManager.AddToRoleAsync(user, dto.Role);
        if (!result.Succeeded)
            return BadRequest(new { message = "Rol atanamadı." });

        await _userManager.UpdateSecurityStampAsync(user);

        return Ok(new { message = "Rol atandı." });
    }

    [HttpDelete("{id}/roles")]
    [DemoDisabled]
    public async Task<IActionResult> RemoveRole(string id, [FromBody] RoleChangeDTO dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (!AllowedRoles.Contains(dto.Role))
            return BadRequest(new { message = "Geçersiz rol." });

        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (id == currentUserId && dto.Role == "Admin")
            return BadRequest(new { message = "Kendi admin yetkinizi kaldıramazsınız." });

        var passwordError = await VerifyAdminPassword(dto.Password);
        if (passwordError != null) return passwordError;

        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            return NotFound(new { message = "Kullanıcı bulunamadı." });

        if (!await _userManager.IsInRoleAsync(user, dto.Role))
            return BadRequest(new { message = "Kullanıcı bu role sahip değil." });

        if (dto.Role == "Admin")
        {
            var adminCount = (await _userManager.GetUsersInRoleAsync("Admin")).Count;
            if (adminCount <= 1)
                return BadRequest(new { message = "Son admin kullanıcısının yetkisi kaldırılamaz." });
        }

        var result = await _userManager.RemoveFromRoleAsync(user, dto.Role);
        if (!result.Succeeded)
            return BadRequest(new { message = "Rol kaldırılamadı." });

        await _userManager.UpdateSecurityStampAsync(user);

        return Ok(new { message = "Rol kaldırıldı." });
    }

    [HttpDelete("{id}")]
    [DemoDisabled]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (id == currentUserId)
            return BadRequest(new { message = "Kendi hesabınızı silemezsiniz." });

        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            return NotFound(new { message = "Kullanıcı bulunamadı." });

        if (await _userManager.IsInRoleAsync(user, "Admin"))
        {
            var adminCount = (await _userManager.GetUsersInRoleAsync("Admin")).Count;
            if (adminCount <= 1)
                return BadRequest(new { message = "Son admin kullanıcısı silinemez." });
        }

        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
            return BadRequest(new { message = "Kullanıcı silinemedi." });

        return Ok(new { message = "Kullanıcı silindi." });
    }

    private async Task<IActionResult?> VerifyAdminPassword(string password)
    {
        var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var admin = await _userManager.FindByIdAsync(adminId!);
        if (admin == null) return Unauthorized();

        var check = await _signInManager.CheckPasswordSignInAsync(admin, password, lockoutOnFailure: true);

        if (check.IsLockedOut)
            return BadRequest(new { message = "Çok fazla hatalı deneme yapıldı. Hesabınız 5 dakika kilitlendi." });

        if (!check.Succeeded)
            return BadRequest(new { message = "Şifre hatalı." });

        return null;
    }
}