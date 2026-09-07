using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using TcgWorld.Api.Data.Entities;

namespace TcgWorld.Api.Services;

// JWT HS256 { sub, role }, cookie httpOnly nommé `Cookie:Name` (défaut tcgworld_token), 7 jours.
public class TokenService(IConfiguration config, IHostEnvironment env)
{
    private readonly string _secret = config["Jwt:Secret"]!;
    private readonly int _expiresDays = int.Parse(config["Jwt:ExpiresDays"] ?? "7");
    public string CookieName { get; } = config["Cookie:Name"] ?? "tcgworld_token";

    public string SignToken(Personne personne)
    {
        var handler = new JwtSecurityTokenHandler();
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            claims: [new Claim("sub", personne.IdPersonne.ToString()), new Claim("role", personne.PrsRole)],
            expires: DateTime.UtcNow.AddDays(_expiresDays),
            signingCredentials: creds
        );
        return handler.WriteToken(token);
    }

    public void SetAuthCookie(HttpResponse response, Personne personne)
    {
        var token = SignToken(personne);
        response.Cookies.Append(CookieName, token, CookieOptions());
    }

    public void ClearAuthCookie(HttpResponse response)
    {
        response.Cookies.Delete(CookieName, CookieOptions());
    }

    private CookieOptions CookieOptions() => new()
    {
        HttpOnly = true,
        SameSite = SameSiteMode.Lax,
        Secure = env.IsProduction(),
        Expires = DateTimeOffset.UtcNow.AddDays(_expiresDays),
    };
}
