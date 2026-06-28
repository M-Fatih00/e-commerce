using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace API.Services;

public class SmtpEmailService
{
    private readonly IConfiguration _config;

    public SmtpEmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendContactEmailAsync(string fromName, string fromEmail, string subject, string message)
    {
        var emailSettings = _config.GetSection("EmailSettings");

        var host = emailSettings["Host"] ?? throw new InvalidOperationException("Email host ayarı eksik.");
        var port = int.Parse(emailSettings["Port"] ?? "587");
        var username = emailSettings["Username"] ?? throw new InvalidOperationException("Email username ayarı eksik.");
        var password = emailSettings["Password"] ?? throw new InvalidOperationException("Email password ayarı eksik.");
        var displayName = emailSettings["FromName"] ?? "E-Commerce";

        var email = new MimeMessage();
        email.From.Add(new MailboxAddress(displayName, username));
        email.To.Add(new MailboxAddress(displayName, username));
        email.ReplyTo.Add(new MailboxAddress(fromName, fromEmail));
        email.Subject = $"[İletişim] {subject}";

        email.Body = new TextPart("html")
        {
            Text = $"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1a1a2e; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
                        Yeni İletişim Mesajı
                    </h2>
                    <table style="width: 100%; margin-bottom: 20px;">
                        <tr>
                            <td style="color: #999; width: 120px;">Ad Soyad:</td>
                            <td><strong>{fromName}</strong></td>
                        </tr>
                        <tr>
                            <td style="color: #999;">E-posta:</td>
                            <td><a href="mailto:{fromEmail}">{fromEmail}</a></td>
                        </tr>
                        <tr>
                            <td style="color: #999;">Konu:</td>
                            <td><strong>{subject}</strong></td>
                        </tr>
                    </table>
                    <div style="background: #f7f8fa; padding: 20px; border-radius: 8px;">
                        <p style="color: #555; line-height: 1.6; margin: 0;">{message}</p>
                    </div>
                    <p style="color: #999; font-size: 12px; margin-top: 20px;">
                        Bu e-posta {DateTime.Now:dd MMMM yyyy HH:mm} tarihinde gönderilmiştir.
                    </p>
                </div>
            """
        };

        using var smtp = new SmtpClient();
        await smtp.ConnectAsync(host, port, SecureSocketOptions.StartTls);
        await smtp.AuthenticateAsync(username, password);
        await smtp.SendAsync(email);
        await smtp.DisconnectAsync(true);
    }
}