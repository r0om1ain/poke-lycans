using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TcgWorld.Api.Dtos;
using TcgWorld.Api.Middleware;
using TcgWorld.Api.Services;

namespace TcgWorld.Api.Controllers;

// Remplace l'API Flask simulée du cahier des charges "MarketPlace Analytics" — mêmes
// routes/rôles (/orders, /sellers, /products), mais servies depuis les vraies données
// TCGWorld. Consommée uniquement par MarketplaceAPIHook (pipeline Airflow), jamais par
// le frontend.
[ApiController]
[Route("api/analytics-export")]
public class AnalyticsExportController(AnalyticsExportService export) : ControllerBase
{
    [HttpGet("health")]
    [AllowAnonymous]
    public IActionResult Health() => Ok(new { status = "ok", version = "1.0" });

    [HttpGet("orders")]
    [Authorize(AuthenticationSchemes = AnalyticsBearerAuthHandler.SchemeName)]
    public async Task<ActionResult<List<ExportOrderDto>>> Orders([FromQuery] string date)
    {
        if (!DateOnly.TryParse(date, out var parsed))
            return BadRequest(new { error = "Paramètre 'date' invalide, format attendu YYYY-MM-DD." });

        return Ok(await export.GetOrdersAsync(parsed));
    }

    [HttpGet("sellers")]
    [Authorize(AuthenticationSchemes = AnalyticsBearerAuthHandler.SchemeName)]
    public Task<List<ExportSellerDto>> Sellers([FromQuery] int? limit) => export.GetSellersAsync(limit);

    [HttpGet("products")]
    [Authorize(AuthenticationSchemes = AnalyticsBearerAuthHandler.SchemeName)]
    public Task<List<ExportProductDto>> Products([FromQuery] int? limit) => export.GetProductsAsync(limit);
}
