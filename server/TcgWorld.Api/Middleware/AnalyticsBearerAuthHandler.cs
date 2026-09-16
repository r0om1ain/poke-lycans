using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace TcgWorld.Api.Middleware;

// Scheme d'auth séparé du JWT cookie applicatif : un token Bearer statique partagé
// avec la Connection Airflow `marketplace_api` (password = token), exactement comme
// l'API Flask simulée du cahier des charges ("formation-token-2026"). N'affecte que
// les routes qui déclarent explicitement ce scheme (AnalyticsExportController).
public class AnalyticsBearerAuthHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder,
    IConfiguration config)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    public const string SchemeName = "AnalyticsBearer";

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var expectedToken = config["Analytics:ExportToken"];
        if (string.IsNullOrEmpty(expectedToken))
            return Task.FromResult(AuthenticateResult.Fail("Analytics:ExportToken n'est pas configuré côté serveur."));

        var header = Request.Headers["Authorization"].ToString();
        if (string.IsNullOrEmpty(header) || !header.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            return Task.FromResult(AuthenticateResult.Fail("En-tête Authorization: Bearer <token> manquant."));

        var token = header["Bearer ".Length..].Trim();
        if (token != expectedToken)
            return Task.FromResult(AuthenticateResult.Fail("Token invalide."));

        var identity = new ClaimsIdentity([new Claim(ClaimTypes.Name, "airflow-pipeline")], SchemeName);
        var ticket = new AuthenticationTicket(new ClaimsPrincipal(identity), SchemeName);
        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
