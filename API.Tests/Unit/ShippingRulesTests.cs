using System.Globalization;
using API.Services;

namespace API.Tests.Unit;

public class ShippingRulesTests
{
    [Theory]
    [InlineData("0", false, "29.99")]
    [InlineData("999.99", false, "29.99")]
    [InlineData("1000", false, "0")]
    [InlineData("2500", false, "0")]
    [InlineData("100", true, "150")]
    [InlineData("2500", true, "150")]
    public void Calculate_ReturnsExpectedFee(string total, bool express, string expected)
    {
        var result = ShippingRules.Calculate(decimal.Parse(total, CultureInfo.InvariantCulture), express);

        Assert.Equal(decimal.Parse(expected, CultureInfo.InvariantCulture), result);
    }
}
