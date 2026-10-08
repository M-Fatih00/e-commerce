using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace API.Filters;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class DemoDisabledAttribute : Attribute, IResourceFilter
{
    public void OnResourceExecuting(ResourceExecutingContext context)
    {
        var config = context.HttpContext.RequestServices.GetRequiredService<IConfiguration>();
        if (!config.GetValue("Demo:Enabled", false)) return;

        context.Result = new ObjectResult(new { message = "Bu işlem demo sürümünde kapalı.", demo = true })
        {
            StatusCode = StatusCodes.Status403Forbidden
        };
    }

    public void OnResourceExecuted(ResourceExecutedContext context) { }
}