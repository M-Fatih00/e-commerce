using API.Services;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactController : ControllerBase
{
    private readonly SmtpEmailService _smtpEmailService;

    public ContactController(SmtpEmailService smtpEmailService)
    {
        _smtpEmailService = smtpEmailService;
    }

    [HttpPost]
    public async Task<IActionResult> SendMessage([FromBody] ContactDTO dto)
    {
        if (string.IsNullOrEmpty(dto.Name) || string.IsNullOrEmpty(dto.Email) ||
            string.IsNullOrEmpty(dto.Subject) || string.IsNullOrEmpty(dto.Message))
            return BadRequest(new { message = "Tüm alanlar zorunludur." });

        try
        {
            await _smtpEmailService.SendContactEmailAsync(dto.Name, dto.Email, dto.Subject, dto.Message);
            return Ok(new { message = "Mesajınız başarıyla gönderildi." });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Email gönderme hatası: {ex.Message}");
            return StatusCode(500, new { message = "Mesaj gönderilemedi. Lütfen tekrar deneyin." });
        }
    }
}

public class ContactDTO
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}