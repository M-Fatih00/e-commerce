using System.Security.Claims;
using System.Linq;
using API.DTO;
using API.Entity;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;


[ApiController]
[Route("api/[controller]")]
public class AccountController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;

    private readonly TokenService _tokenService;
    private readonly IWebHostEnvironment _env;

    public AccountController(UserManager<AppUser> userManager, TokenService tokenService, IWebHostEnvironment env)
    {
        _userManager = userManager;
        _tokenService = tokenService;
        _env = env;
    }



    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDTO dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var user = new AppUser
        {
            FullName = dto.AdSoyad,
            UserName = dto.UserName,
            Email = dto.Email,
            Avatar = null
        };

        var result = await _userManager.CreateAsync(user, dto.Password);

        if (result.Succeeded)
        {
            var roleResult = await _userManager.AddToRoleAsync(user, "Customer");
            if (!roleResult.Succeeded)
                return BadRequest(new { message = "Kullanıcı oluşturuldu ancak rol atanamadı." });

            return Ok(new UserDTO { Name = user.UserName! });
        }

        var errors = result.Errors.Select(e => e.Code switch
        {
            "DuplicateUserName" => "Bu kullanıcı adı zaten kullanılıyor.",
            "DuplicateEmail" => "Bu e-posta adresi zaten kayıtlı.",
            "PasswordTooShort" => "Şifre en az 6 karakter olmalıdır.",
            _ => e.Description
        });

        return BadRequest(new { message = string.Join(" ", errors) });
    }



    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDTO dto)
    {
        var user = await _userManager.FindByNameAsync(dto.UserName);
        var result = user != null && await _userManager.CheckPasswordAsync(user, dto.Password);

        if (!result)
            return BadRequest(new { message = "Kullanıcı adı veya şifre hatalı." });

        var token = await _tokenService.GenerateToken(user!, dto.RememberMe);

        var expires = dto.RememberMe
            ? DateTime.UtcNow.AddDays(30)
            : DateTime.UtcNow.AddHours(2);

        Response.Cookies.Append("jwt", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = !_env.IsDevelopment(),
            SameSite = SameSiteMode.Lax,
            Expires = expires
        });

        var roles = await _userManager.GetRolesAsync(user!);

        return Ok(new UserDTO
        {
            Name = user!.UserName!,
            Role = roles.FirstOrDefault()
        });
    }


    [HttpGet("getUser")]
    [Authorize]
    public async Task<IActionResult> GetUser()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return Unauthorized();

        var roles = await _userManager.GetRolesAsync(user);

        return Ok(new
        {
            id = user.Id,
            email = user.Email,
            fullName = user.FullName,
            userName = user.UserName,
            roles = roles,
            avatar = user.Avatar
        });
    }


    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("jwt");

        return Ok();
    }


    [HttpPut("update")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDTO dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await _userManager.FindByIdAsync(userId!);
        if (user == null) return Unauthorized();

        user.FullName = dto.FullName ?? user.FullName;
        user.UserName = dto.UserName ?? user.UserName;
        user.Email = dto.Email ?? user.Email;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var errors = result.Errors.Select(e => e.Code switch
            {
                "DuplicateUserName" => "Bu kullanıcı adı zaten kullanılıyor.",
                "DuplicateEmail" => "Bu e-posta adresi zaten kayıtlı.",
                _ => e.Description
            });
            return BadRequest(new { message = string.Join(" ", errors) });
        }

        return Ok(new { fullName = user.FullName, userName = user.UserName, email = user.Email });
    }



    private static readonly string[] _allowedImageExtensions = { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
    private const long _maxAvatarSize = 5 * 1024 * 1024; // 5 MB

    private string? ValidateImage(IFormFile file)
    {
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!_allowedImageExtensions.Contains(ext))
            return $"Geçersiz dosya türü: {ext}. Sadece resim yükleyebilirsiniz (jpg, png, webp, gif).";

        if (file.Length > _maxAvatarSize)
            return "Dosya boyutu 5 MB'tan büyük olamaz.";

        if (file.Length == 0)
            return "Boş dosya yüklenemez.";

        return null;
    }

    [HttpPut("avatar")]
    [Authorize]
    public async Task<IActionResult> UpdateAvatar([FromForm] AvatarDTO dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await _userManager.FindByIdAsync(userId!);
        if (user == null) return Unauthorized();

        var imageError = ValidateImage(dto.Avatar);
        if (imageError != null) return BadRequest(new { message = imageError });

        var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/img/avatars");
        if (!Directory.Exists(uploadPath)) Directory.CreateDirectory(uploadPath);

        if (!string.IsNullOrEmpty(user.Avatar))
        {
            var oldPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/img", user.Avatar);
            if (System.IO.File.Exists(oldPath)) System.IO.File.Delete(oldPath);
        }

        var fileName = Guid.NewGuid() + Path.GetExtension(dto.Avatar.FileName);
        var filePath = Path.Combine(uploadPath, fileName);

        using var stream = new FileStream(filePath, FileMode.Create);
        await dto.Avatar.CopyToAsync(stream);

        user.Avatar = "avatars/" + fileName;
        await _userManager.UpdateAsync(user);

        return Ok(new { avatar = user.Avatar });
    }

}