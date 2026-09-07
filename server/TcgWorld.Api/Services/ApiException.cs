namespace TcgWorld.Api.Services;

// Miroir de server/src/lib/httpError.js — exception typée portant un status
// HTTP, interceptée par le middleware d'erreurs global.
public class ApiException(int status, string message, object? details = null) : Exception(message)
{
    public int Status { get; } = status;
    public object? Details { get; } = details;

    public static ApiException NotFound(string message = "Ressource introuvable") => new(404, message);
    public static ApiException BadRequest(string message = "Requête invalide", object? details = null) => new(400, message, details);
    public static ApiException Unauthorized(string message = "Authentification requise") => new(401, message);
    public static ApiException Forbidden(string message = "Accès refusé") => new(403, message);
    public static ApiException Conflict(string message = "Conflit") => new(409, message);
}
