using API.Filters;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace API.Tests.Unit;

public class DemoDisabledAttributeTests
{
    private static ResourceExecutingContext CreateContext(bool demoEnabled)
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?> { ["Demo:Enabled"] = demoEnabled.ToString() })
            .Build();

        var services = new ServiceCollection()
            .AddSingleton<IConfiguration>(config)
            .BuildServiceProvider();

        var httpContext = new DefaultHttpContext { RequestServices = services };
        var actionContext = new ActionContext(httpContext, new RouteData(), new ActionDescriptor());

        return new ResourceExecutingContext(actionContext, new List<IFilterMetadata>(), new List<IValueProviderFactory>());
    }

    [Fact]
    public void BlocksRequest_WhenDemoEnabled()
    {
        var context = CreateContext(demoEnabled: true);

        new DemoDisabledAttribute().OnResourceExecuting(context);

        var result = Assert.IsType<ObjectResult>(context.Result);
        Assert.Equal(StatusCodes.Status403Forbidden, result.StatusCode);
    }

    [Fact]
    public void AllowsRequest_WhenDemoDisabled()
    {
        var context = CreateContext(demoEnabled: false);

        new DemoDisabledAttribute().OnResourceExecuting(context);

        Assert.Null(context.Result);
    }
}
