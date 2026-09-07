using Microsoft.EntityFrameworkCore;
using TcgWorld.Api.Data;
using TcgWorld.Api.Dtos;

namespace TcgWorld.Api.Services;

// Progression de collection par série — % = cartes possédées / total de cartes de
// la série (les datItem/produits scellés ne comptent jamais), arrondi à 1 décimale,
// trié par pourcentage décroissant (miroir de server/src/services/seriesProgressService.js).
public class SeriesProgressService(AppDbContext db)
{
    public async Task<List<ProgressionSerieDto>> GetProgressAsync(int idPersonne)
    {
        var possedeesParSerie = await db.CollectionsCarte
            .Where(c => c.Collection.IdPersonne == idPersonne)
            .Include(c => c.Carte)
            .GroupBy(c => c.Carte.IdSerie)
            .Select(g => new { IdSerie = g.Key, Count = g.Select(c => c.IdCarte).Distinct().Count() })
            .ToDictionaryAsync(x => x.IdSerie, x => x.Count);

        var totalParSerie = await db.Cartes
            .Where(c => !c.CrtFlgArchive)
            .GroupBy(c => c.IdSerie)
            .Select(g => new { IdSerie = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.IdSerie, x => x.Count);

        var idsSeries = possedeesParSerie.Keys.Union(totalParSerie.Keys).ToList();
        var series = await db.Series.Where(s => idsSeries.Contains(s.IdSerie)).ToListAsync();

        var result = new List<ProgressionSerieDto>();
        foreach (var serie in series)
        {
            var possedees = possedeesParSerie.GetValueOrDefault(serie.IdSerie);
            var total = totalParSerie.GetValueOrDefault(serie.IdSerie);
            var pourcentage = total > 0 ? Math.Round((decimal)possedees / total * 100, 1) : 0;
            result.Add(new ProgressionSerieDto(SerieDto.From(serie), possedees, total, pourcentage));
        }
        return [.. result.OrderByDescending(r => r.Pourcentage)];
    }
}
