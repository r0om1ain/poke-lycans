using TcgWorld.Api.Services;

namespace TcgWorld.Api.Middleware;

// Miroir de server/src/middleware/errorHandler.js.
public class ErrorHandlingMiddleware(RequestDelegate next, IHostEnvironment env, ILogger<ErrorHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (ApiException ex)
        {
            context.Response.StatusCode = ex.Status;
            await context.Response.WriteAsJsonAsync(new { error = ex.Message, details = ex.Details });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erreur interne du serveur");
            context.Response.StatusCode = 500;
            if (env.IsDevelopment())
                await context.Response.WriteAsJsonAsync(new { error = "Erreur interne du serveur", detail = ex.Message, stack = ex.StackTrace });
            else
                await context.Response.WriteAsJsonAsync(new { error = "Erreur interne du serveur" });
        }
    }
}
