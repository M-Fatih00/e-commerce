using System.Net;
using System.Text.RegularExpressions;
using Ganss.Xss;

namespace API.Services;

public static class HtmlContentSanitizer
{
    private static readonly HtmlSanitizer Sanitizer = Create();

    private static HtmlSanitizer Create()
    {
        var sanitizer = new HtmlSanitizer();

        sanitizer.AllowedTags.Clear();
        sanitizer.AllowedTags.UnionWith(new[]
        {
            "p", "br", "h1", "h2", "h3", "strong", "b", "em", "i", "u", "s",
            "ul", "ol", "li", "blockquote", "code", "pre", "hr", "span"
        });

        sanitizer.AllowedAttributes.Clear();
        sanitizer.AllowedAttributes.Add("style");

        sanitizer.AllowedCssProperties.Clear();
        sanitizer.AllowedCssProperties.UnionWith(new[] { "color", "text-align" });

        return sanitizer;
    }

    public static string Sanitize(string? html) => Sanitizer.Sanitize(html ?? "").Trim();

    public static string ToPlainText(string html) =>
        WebUtility.HtmlDecode(Regex.Replace(html, "<[^>]+>", " ")).Trim();
}