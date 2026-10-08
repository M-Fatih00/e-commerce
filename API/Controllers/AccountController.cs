using System.Security.Claims;
using API.DTO;
using API.Entity;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    private readonly SignInManager<AppUser> _signInManager;
    private readonly TokenService _tokenService;
    private readonly IWebHostEnvironment _env;

    public AccountController(UserManager<AppUser> userManager, SignInManager<AppUser> signInManager,
        TokenService tokenService, IWebHostEnvironment env)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
        _env = env;
    }

    [HttpPost("register")]
    [EnableRateLimiting("register")]
    public async Task<IActionResult> Register(RegisterDTO dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var user = new AppUser
        {
            FullName = dto.AdSoyad.Trim(),
            UserName = dto.UserName.Trim(),
            Email = dto.Email.Trim(),
            Avatar = null
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            return BadRequest(new { message = TranslateErrors(result.Errors) });

        var roleResult = await _userManager.AddToRoleAsync(user, "Customer");
        if (!roleResult.Succeeded)
        {
            await _userManager.DeleteAsync(user);
            return StatusCode(500, new { message = "Kayıt tamamlanamadı. Lütfen tekrar deneyin." });
        }

        return Ok(new UserDTO { Name = user.UserName! });
    }

    [HttpPost("login")]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> Login(LoginDTO dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { message = "Kullanıcı adı ve şifre zorunludur." });

        var user = await _userManager.FindByNameAsync(dto.UserName.Trim());
        if (user == null)
            return BadRequest(new { message = "Kullanıcı adı veya şifre hatalı." });

        var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, lockoutOnFailure: true);

        if (result.IsLockedOut)
            return BadRequest(new { message = "Çok fazla hatalı deneme yapıldı. Hesap 5 dakika kilitlendi." });

        if (!result.Succeeded)
            return BadRequest(new { message = "Kullanıcı adı veya şifre hatalı." });

        var token = await _tokenService.GenerateToken(user, dto.RememberMe);

        var expires = dto.RememberMe
            ? DateTime.UtcNow.AddDays(30)
            : DateTime.UtcNow.AddHours(2);

        Response.Cookies.Append("jwt", token, JwtCookieOptions(expires));

        var roles = await _userManager.GetRolesAsync(user);

        return Ok(new UserDTO
        {
            Name = user.UserName!,
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
        Response.Cookies.Delete("jwt", JwtCookieOptions());
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
            return BadRequest(new { message = TranslateErrors(result.Errors) });

        return Ok(new { fullName = user.FullName, userName = user.UserName, email = user.Email });
    }

    private static readonly string[] _allowedImageExtensions = { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
    private const long _maxAvatarSize = 5 * 1024 * 1024;

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

    private CookieOptions JwtCookieOptions(DateTime? expires = null) => new()
    {
        HttpOnly = true,
        Secure = !_env.IsDevelopment(),
        SameSite = SameSiteMode.Lax,
        Path = "/",
        Expires = expires
    };

    private static string TranslateErrors(IEnumerable<IdentityError> errors) =>
        string.Join(" ", errors.Select(e => e.Code switch
        {
            "DuplicateUserName" => "Bu kullanıcı adı zaten kullanılıyor.",
            "DuplicateEmail" => "Bu e-posta adresi zaten kayıtlı.",
            "InvalidUserName" => "Kullanıcı adı sadece İngilizce harf, rakam ve - . _ @ + karakterlerini içerebilir.",
            "InvalidEmail" => "Geçerli bir e-posta adresi girin.",
            "PasswordTooShort" => "Şifre en az 6 karakter olmalıdır.",
            _ => e.Description
        }));
}