using System.Text;
using API.Services;
using Microsoft.AspNetCore.Http;

namespace API.Tests.Unit;

public class ImageValidatorTests
{
    private static IFormFile CreateFile(byte[] content, string fileName = "image.jpg") =>
        new FormFile(new MemoryStream(content), 0, content.Length, "file", fileName);

    private static byte[] WithHeader(byte[] header, int totalLength = 64)
    {
        var bytes = new byte[Math.Max(totalLength, header.Length)];
        header.CopyTo(bytes, 0);
        return bytes;
    }

    public static IEnumerable<object[]> ValidImages() => new[]
    {
        new object[] { new byte[] { 0xFF, 0xD8, 0xFF, 0xE0 }, ".jpg" },
        new object[] { new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A }, ".png" },
        new object[] { Encoding.ASCII.GetBytes("GIF89a"), ".gif" },
        new object[] { Encoding.ASCII.GetBytes("RIFF\0\0\0\0WEBP"), ".webp" },
    };

    [Theory]
    [MemberData(nameof(ValidImages))]
    public async Task ValidateAsync_AcceptsRealImages(byte[] header, string expectedExtension)
    {
        var (extension, error) = await ImageValidator.ValidateAsync(CreateFile(WithHeader(header)));

        Assert.Null(error);
        Assert.Equal(expectedExtension, extension);
    }

    [Fact]
    public async Task ValidateAsync_RejectsTextFileWithImageExtension()
    {
        var content = Encoding.UTF8.GetBytes("<script>alert('x')</script>");

        var (extension, error) = await ImageValidator.ValidateAsync(CreateFile(content, "photo.jpg"));

        Assert.Null(extension);
        Assert.NotNull(error);
    }

    [Fact]
    public async Task ValidateAsync_RejectsMissingOrEmptyFile()
    {
        var (_, nullError) = await ImageValidator.ValidateAsync(null);
        var (_, emptyError) = await ImageValidator.ValidateAsync(CreateFile(Array.Empty<byte>()));

        Assert.NotNull(nullError);
        Assert.NotNull(emptyError);
    }

    [Fact]
    public async Task ValidateAsync_RejectsFilesLargerThanLimit()
    {
        var content = WithHeader(new byte[] { 0xFF, 0xD8, 0xFF }, (int)ImageValidator.MaxSize + 1);

        var (extension, error) = await ImageValidator.ValidateAsync(CreateFile(content));

        Assert.Null(extension);
        Assert.NotNull(error);
    }
}
