using System.Security.Claims;
using API.DTO;
using API.Entity;
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
    private readonly UserManager<AppUser> _userManager;

    public UsersController(UserManager<AppUser> userManager)
    {
        _userManager = userManager;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _userManager.Users.ToListAsync();

        var result = new List<object>();
        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            result.Add(new
            {
                user.Id,
                user.UserName,
                user.Email,
                user.FullName,
                user.Avatar,
                Roles = roles
            });
        }

        return Ok(result);
    }


    [HttpPost("{id}/roles")]
    public async Task<IActionResult> AddRole(string id, [FromBody] RoleChangeDTO dto)
    {
        // Admin'in kendi şifresini doğrula
        var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var admin = await _userManager.FindByIdAsync(adminId!);
        var passwordCheck = await _userManager.CheckPasswordAsync(admin!, dto.Password);

        if (!passwordCheck)
            return BadRequest(new { message = "Şifre hatalı." });

        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound();

        var result = await _userManager.AddToRoleAsync(user, dto.Role);
        if (!result.Succeeded) return BadRequest(result.Errors);

        return Ok();
    }


    [HttpDelete("{id}/roles")]
    public async Task<IActionResult> RemoveRole(string id, [FromBody] RoleChangeDTO dto)
    {
        var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var admin = await _userManager.FindByIdAsync(adminId!);
        var passwordCheck = await _userManager.CheckPasswordAsync(admin!, dto.Password);

        if (!passwordCheck)
            return BadRequest(new { message = "Şifre hatalı." });

        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound();

        // Son admin kontrolü
        if (dto.Role == "Admin")
        {
            var adminCount = (await _userManager.GetUsersInRoleAsync("Admin")).Count;
            if (adminCount <= 1)
                return BadRequest(new { message = "Son admin kullanıcısının yetkisi kaldırılamaz." });
        }

        var result = await _userManager.RemoveFromRoleAsync(user, dto.Role);
        if (!result.Succeeded) return BadRequest(result.Errors);

        return Ok();
    }



    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        // Kendini silemesin
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (id == currentUserId)
            return BadRequest(new { message = "Kendi hesabınızı silemezsiniz." });

        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound(new { message = "Kullanıcı bulunamadı." });

        // Son admin kontrolü
        var isAdmin = await _userManager.IsInRoleAsync(user, "Admin");
        if (isAdmin)
        {
            var adminCount = (await _userManager.GetUsersInRoleAsync("Admin")).Count;
            if (adminCount <= 1)
                return BadRequest(new { message = "Son admin kullanıcısı silinemez." });
        }

        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        return Ok(new { message = "Kullanıcı silindi." });
    }
}