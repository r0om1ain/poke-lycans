using TcgWorld.Api.Data.Entities;

namespace TcgWorld.Api.Services;

// "{code} : {nom}" — jamais le code seul (miroir de server/src/lib/formatSeries.js).
public static class FormatSerieHelper
{
    public static string Format(Serie serie) =>
        string.IsNullOrEmpty(serie.SerCode) ? serie.SerNom : $"{serie.SerCode} : {serie.SerNom}";
}
