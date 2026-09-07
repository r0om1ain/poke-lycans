using Microsoft.EntityFrameworkCore;
using TcgWorld.Api.Data;
using TcgWorld.Api.Data.Entities;
using TcgWorld.Api.Dtos;

namespace TcgWorld.Api.Services;

// Persistance serveur des "vus récemment" (datVueRecente) — remplace le localStorage
// client de la première passe.
public class VueRecenteService(AppDbContext db)
{
    public async Task EnregistrerAsync(int idPersonne, int? idCarte, int? idItem)
    {
        if (idCarte is null && idItem is null) throw ApiException.BadRequest("idCarte ou idItem requis");
        db.VuesRecentes.Add(new VueRecente { IdPersonne = idPersonne, IdCarte = idCarte, IdItem = idItem, VrcDateVue = DateTime.UtcNow });
        await db.SaveChangesAsync();
    }

    public async Task<List<ProduitResumeDto>> ListerAsync(int idPersonne, int limit)
    {
        var vues = await db.VuesRecentes
            .Where(v => v.IdPersonne == idPersonne)
            .OrderByDescending(v => v.VrcDateVue)
            .Include(v => v.Carte!).ThenInclude(c => c.Serie)
            .Include(v => v.Item!).ThenInclude(i => i.Serie)
            .Take(limit * 3) // marge pour dédupliquer les vues répétées du même produit
            .ToListAsync();

        var result = new List<ProduitResumeDto>();
        var seen = new HashSet<string>();
        foreach (var v in vues)
        {
            string key;
            ProduitResumeDto dto;
            if (v.Carte is not null) { key = $"carte:{v.IdCarte}"; dto = ProduitResumeDto.FromCarte(v.Carte); }
            else if (v.Item is not null) { key = $"item:{v.IdItem}"; dto = ProduitResumeDto.FromItem(v.Item); }
            else continue;
            if (seen.Add(key)) result.Add(dto);
            if (result.Count >= limit) break;
        }
        return result;
    }
}
