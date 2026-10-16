using System.Globalization;
using System.Net;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace API.Services;

public class SmtpEmailService
{
    private static readonly CultureInfo Turkish = new("tr-TR");

    private readonly IConfiguration _config;

    public SmtpEmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendContactEmailAsync(string fromName, string fromEmail, string subject, string message)
    {
        var settings = _config.GetSection("EmailSettings");

        var host = settings["Host"] ?? throw new InvalidOperationException("EmailSettings:Host tanımlı değil.");
        var port = int.Parse(settings["Port"] ?? "587");
        var username = settings["Username"] ?? throw new InvalidOperationException("EmailSettings:Username tanımlı değil.");
        var password = settings["Password"] ?? throw new InvalidOperationException("EmailSettings:Password tanımlı değil.");
        var displayName = settings["FromName"] ?? "E-Commerce";

        var name = SingleLine(fromName);
        var topic = SingleLine(subject);
        var sentAt = DateTime.Now.ToString("dd MMMM yyyy HH:mm", Turkish);
        var htmlMessage = Encode(message).Replace("\r\n", "\n").Replace("\n", "<br>");

        var email = new MimeMessage();
        email.From.Add(new MailboxAddress(displayName, username));
        email.To.Add(new MailboxAddress(displayName, username));
        email.ReplyTo.Add(new MailboxAddress(name, fromEmail));
        email.Subject = $"[İletişim] {topic}";

        var body = new BodyBuilder
        {
            TextBody =
                $"Yeni iletişim mesajı\n\nAd Soyad: {name}\nE-posta: {fromEmail}\nKonu: {topic}\n\n{message}\n\nGönderim: {sentAt}",
            HtmlBody = $"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1a1a2e; border-bottom: 2px solid #3498db; padding-bottom: 10px;">Yeni İletişim Mesajı</h2>
                    <table style="width: 100%; margin-bottom: 20px;">
                        <tr><td style="color: #999; width: 120px;">Ad Soyad:</td><td><strong>{Encode(name)}</strong></td></tr>
                        <tr><td style="color: #999;">E-posta:</td><td>{Encode(fromEmail)}</td></tr>
                        <tr><td style="color: #999;">Konu:</td><td><strong>{Encode(topic)}</strong></td></tr>
                    </table>
                    <div style="background: #f7f8fa; padding: 20px; border-radius: 8px;">
                        <p style="color: #555; line-height: 1.6; margin: 0;">{htmlMessage}</p>
                    </div>
                    <p style="color: #999; font-size: 12px; margin-top: 20px;">Gönderim: {sentAt}. Yanıtlamak için bu e-postayı doğrudan yanıtlayabilirsiniz.</p>
                </div>
                """
        };

        email.Body = body.ToMessageBody();

        using var smtp = new SmtpClient { CheckCertificateRevocation = false };
        await smtp.ConnectAsync(host, port, SecureSocketOptions.StartTls);
        await smtp.AuthenticateAsync(username, password);
        await smtp.SendAsync(email);
        await smtp.DisconnectAsync(true);
    }

    private static string Encode(string value) => WebUtility.HtmlEncode(value);

    private static string SingleLine(string value) =>
        string.Join(' ', value.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries)).Trim();
}