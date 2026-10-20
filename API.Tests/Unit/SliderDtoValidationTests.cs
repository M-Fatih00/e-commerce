using System.ComponentModel.DataAnnotations;
using API.DTO;
using Microsoft.AspNetCore.Http;

namespace API.Tests.Unit;

public class SliderDtoValidationTests
{
    private static List<ValidationResult> Validate(string? link)
    {
        var dto = new CreateSliderDTO
        {
            Resim = new FormFile(new MemoryStream(new byte[] { 1 }), 0, 1, "resim", "a.jpg"),
            ButonMetni = "İncele",
            ButonLinki = link
        };

        var results = new List<ValidationResult>();
        Validator.TryValidateObject(dto, new ValidationContext(dto), results, validateAllProperties: true);
        return results;
    }

    [Theory]
    [InlineData("/shop")]
    [InlineData("/shop?category=6")]
    [InlineData("/blog/3")]
    [InlineData(null)]
    public void ButonLinki_AcceptsInternalLinks(string? link)
    {
        Assert.Empty(Validate(link));
    }

    [Theory]
    [InlineData("https://example.com")]
    [InlineData("//example.com")]
    [InlineData("javascript:alert(1)")]
    [InlineData("shop")]
    [InlineData("/shop<script>")]
    public void ButonLinki_RejectsExternalOrUnsafeLinks(string link)
    {
        Assert.Contains(Validate(link), r => r.MemberNames.Contains(nameof(CreateSliderDTO.ButonLinki)));
    }
}
