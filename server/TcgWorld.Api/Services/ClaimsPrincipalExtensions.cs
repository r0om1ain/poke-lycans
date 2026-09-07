using System.Security.Claims;

namespace TcgWorld.Api.Services;

public static class ClaimsPrincipalExtensions
{
    public static int PersonId(this ClaimsPrincipal user) =>
        int.TryParse(user.FindFirstValue("sub"), out var id) ? id : throw ApiException.Unauthorized();
}
