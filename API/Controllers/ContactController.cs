using API.DTO;
using API.Filters;
using API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactController : ControllerBase
{
    private readonly SmtpEmailService _smtpEmailService;
    private readonly ILogger<ContactController> _logger;

    public ContactController(SmtpEmailService smtpEmailService, ILogger<ContactController> logger)
    {
        _smtpEmailService = smtpEmailService;
        _logger = logger;
    }

    [HttpPost]
    [DemoDisabled]
    [EnableRateLimiting("contact")]
    public async Task<IActionResult> SendMessage([FromBody] ContactDTO dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var name = dto.Name.Trim();
        var email = dto.Email.Trim();
        var subject = dto.Subject.Trim();
        var message = dto.Message.Trim();

        if (name.Length == 0 || subject.Length == 0 || message.Length == 0)
            return BadRequest(new { message = "Tüm alanlar zorunludur." });

        try
        {
            await _smtpEmailService.SendContactEmailAsync(name, email, subject, message);
            return Ok(new { message = "Mesajınız gönderildi. En kısa sürede dönüş yapacağız." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "İletişim e-postası gönderilemedi.");
            return StatusCode(StatusCodes.Status503ServiceUnavailable,
                new { message = "Mesajınız şu an gönderilemedi. Lütfen daha sonra tekrar deneyin." });
        }
    }
}