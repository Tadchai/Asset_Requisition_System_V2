using api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Threading.Tasks;

public class UserFilter : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var subId = context.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!string.IsNullOrEmpty(subId))
        {
            var dbcontext = context.HttpContext.RequestServices.GetRequiredService<EquipmentBorrowingV2Context>();

            var user = await dbcontext.Users.Where(x => x.SubjectId == subId).Select(x => new { x.UserId }).SingleOrDefaultAsync();

            if (user != null)
            {
                var identity = context.HttpContext.User.Identity as ClaimsIdentity;
                if (identity != null)
                {
                    identity.AddClaim(new Claim("userId", user.UserId.ToString()));
                }
            }
        }
        await next();
    }


}
