using System.Security.Claims;
using API.DTO;
using API.Entity;
using API.Filters;
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
    private const long AvatarRequestLimit = ImageValidator.MaxSize + 1024 * 1024;

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

        var expires = dto.RememberMe
            ? DateTime.UtcNow.AddDays(30)
            : DateTime.UtcNow.AddHours(2);

        await IssueAuthCookie(user, expires);

        var roles = await _userManager.GetRolesAsync(user);

        return Ok(new UserDTO
        {
            Name = user.UserName!,
            Role = roles.FirstOrDefault()
        });
    }

    [HttpGet("getUser")]
    [AllowAnonymous]
    public async Task<IActionResult> GetUser()
    {
        if (User.Identity?.IsAuthenticated != true)
            return Unauthorized();

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
    [DemoDisabled]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDTO dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await _userManager.FindByIdAsync(userId!);
        if (user == null) return Unauthorized();

        var fullName = dto.FullName?.Trim();
        var userName = dto.UserName?.Trim();
        var email = dto.Email?.Trim();

        if (fullName is not null)
        {
            if (fullName.Length == 0)
                return BadRequest(new { message = "Ad soyad boş olamaz." });

            user.FullName = fullName;
            var updateResult = await _userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
                return BadRequest(new { message = TranslateErrors(updateResult.Errors) });
        }

        if (userName is not null && userName != user.UserName)
        {
            var userNameResult = await _userManager.SetUserNameAsync(user, userName);
            if (!userNameResult.Succeeded)
                return BadRequest(new { message = TranslateErrors(userNameResult.Errors) });
        }

        if (email is not null && !string.Equals(email, user.Email, StringComparison.OrdinalIgnoreCase))
        {
            var emailResult = await _userManager.SetEmailAsync(user, email);
            if (!emailResult.Succeeded)
                return BadRequest(new { message = TranslateErrors(emailResult.Errors) });
        }

        await IssueAuthCookie(user, CurrentTokenExpiry());

        return Ok(new { fullName = user.FullName, userName = user.UserName, email = user.Email });
    }

    [HttpPut("avatar")]
    [Authorize]
    [DemoDisabled]
    [RequestSizeLimit(AvatarRequestLimit)]
    [RequestFormLimits(MultipartBodyLengthLimit = AvatarRequestLimit)]
    public async Task<IActionResult> UpdateAvatar([FromForm] AvatarDTO dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(new { message = "Dosya seçilmedi." });

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var user = await _userManager.FindByIdAsync(userId!);
        if (user == null) return Unauthorized();

        var (extension, error) = await ImageValidator.ValidateAsync(dto.Avatar);
        if (error != null) return BadRequest(new { message = error });

        var avatarsDir = Path.Combine(_env.WebRootPath, "img", "avatars");
        Directory.CreateDirectory(avatarsDir);

        var fileName = Guid.NewGuid() + extension;
        var filePath = Path.Combine(avatarsDir, fileName);

        await using (var stream = new FileStream(filePath, FileMode.CreateNew))
            await dto.Avatar!.CopyToAsync(stream);

        var oldAvatar = user.Avatar;
        user.Avatar = "avatars/" + fileName;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            System.IO.File.Delete(filePath);
            return StatusCode(500, new { message = "Profil fotoğrafı kaydedilemedi." });
        }

        DeleteAvatarFile(oldAvatar);

        return Ok(new { avatar = user.Avatar });
    }

    private async Task IssueAuthCookie(AppUser user, DateTime expiresUtc)
    {
        var token = await _tokenService.GenerateToken(user, expiresUtc);
        Response.Cookies.Append("jwt", token, JwtCookieOptions(expiresUtc));
    }

    private DateTime CurrentTokenExpiry()
    {
        var exp = User.FindFirstValue("exp");
        return long.TryParse(exp, out var seconds)
            ? DateTimeOffset.FromUnixTimeSeconds(seconds).UtcDateTime
            : DateTime.UtcNow.AddHours(2);
    }

    private void DeleteAvatarFile(string? avatar)
    {
        if (string.IsNullOrEmpty(avatar)) return;

        var avatarsDir = Path.GetFullPath(Path.Combine(_env.WebRootPath, "img", "avatars"));
        var path = Path.GetFullPath(Path.Combine(_env.WebRootPath, "img", avatar));

        if (path.StartsWith(avatarsDir + Path.DirectorySeparatorChar) && System.IO.File.Exists(path))
            System.IO.File.Delete(path);
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