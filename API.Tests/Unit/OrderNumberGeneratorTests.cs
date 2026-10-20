using System.Text.RegularExpressions;
using API.Services;

namespace API.Tests.Unit;

public class OrderNumberGeneratorTests
{
    [Fact]
    public void Generate_ReturnsTenDigitNumberNotStartingWithZero()
    {
        for (var i = 0; i < 1000; i++)
        {
            var number = OrderNumberGenerator.Generate();
            Assert.Matches(new Regex(@"^[1-9]\d{9}$"), number);
        }
    }

    [Fact]
    public void Generate_ProducesDifferentNumbers()
    {
        var numbers = Enumerable.Range(0, 1000).Select(_ => OrderNumberGenerator.Generate()).ToHashSet();
        Assert.True(numbers.Count > 990);
    }
}
