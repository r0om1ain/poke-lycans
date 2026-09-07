using Microsoft.EntityFrameworkCore;
using TcgWorld.Api.Data;
using TcgWorld.Api.Data.Entities;
using TcgWorld.Api.Dtos;

namespace TcgWorld.Api.Services;

// datPanier/datPanierLigne — panier entièrement dérivé du serveur, groupé par
// vendeur (le front refetch après chaque mutation, pas de logique locale).
public class CartService(AppDbContext db)
{
    private async Task<Panier> GetOrCreateAsync(int idPersonne)
    {
        var panier = await db.Paniers.FirstOrDefaultAsync(p => p.IdPersonne == idPersonne);
        if (panier is not null) return panier;
        panier = new Panier { IdPersonne = idPersonne };
        db.Paniers.Add(panier);
        await db.SaveChangesAsync();
        return panier;
    }

    public async Task<PanierDto> GetAsync(int idPersonne)
    {
        var panier = await GetOrCreateAsync(idPersonne);
        var lignes = await db.PanierLignes.Where(l => l.IdPanier == panier.IdPanier)
            .Include(l => l.Annonce).ThenInclude(a => a.Personne)
            .Include(l => l.Annonce).ThenInclude(a => a.Carte!).ThenInclude(c => c.Serie)
            .Include(l => l.Annonce).ThenInclude(a => a.Item!).ThenInclude(i => i.Serie)
            .Include(l => l.Annonce).ThenInclude(a => a.AnnonceCarte)
            .Include(l => l.Annonce).ThenInclude(a => a.Photos)
            .ToListAsync();

        var groupes = lignes.GroupBy(l => l.Annonce.IdPersonne).Select(g =>
        {
            var vendeur = VendeurResumeDto.From(g.First().Annonce.Personne);
            var lignesDto = g.Select(l => new PanierLigneDto(l.IdPanierLigne, AnnonceDto.From(l.Annonce), l.PnlQuantite, l.PnlPrixUnitaire)).ToList();
            var sousTotal = lignesDto.Sum(l => l.PrixUnitaire * l.Quantite);
            return new PanierVendeurDto(vendeur, lignesDto, sousTotal);
        }).ToList();

        var summary = new PanierSummaryDto(groupes.Count, lignes.Sum(l => l.PnlQuantite), groupes.Sum(g => g.SousTotal));
        return new PanierDto(groupes, summary);
    }

    public async Task<PanierDto> AddAsync(int idPersonne, AddPanierRequest req)
    {
        var panier = await GetOrCreateAsync(idPersonne);
        var annonce = await db.Annonces.FindAsync(req.IdAnnonce) ?? throw ApiException.NotFound("Annonce introuvable");
        if (annonce.AnnStatut != AnnonceStatut.ACTIVE) throw ApiException.Conflict("Cette annonce n'est plus disponible");

        var ligne = await db.PanierLignes.FirstOrDefaultAsync(l => l.IdPanier == panier.IdPanier && l.IdAnnonce == req.IdAnnonce);
        if (ligne is null)
        {
            ligne = new PanierLigne { IdPanier = panier.IdPanier, IdAnnonce = req.IdAnnonce, PnlQuantite = Math.Max(req.Quantite, 1), PnlPrixUnitaire = annonce.AnnPrix };
            db.PanierLignes.Add(ligne);
        }
        else
        {
            ligne.PnlQuantite += Math.Max(req.Quantite, 1);
        }
        await db.SaveChangesAsync();
        return await GetAsync(idPersonne);
    }

    public async Task<PanierDto> UpdateQuantityAsync(int idLigne, int idPersonne, UpdatePanierRequest req)
    {
        var ligne = await db.PanierLignes.Include(l => l.Panier).FirstOrDefaultAsync(l => l.IdPanierLigne == idLigne) ?? throw ApiException.NotFound();
        if (ligne.Panier.IdPersonne != idPersonne) throw ApiException.Forbidden();
        ligne.PnlQuantite = Math.Max(req.Quantite, 1);
        await db.SaveChangesAsync();
        return await GetAsync(idPersonne);
    }

    public async Task<PanierDto> RemoveAsync(int idLigne, int idPersonne)
    {
        var ligne = await db.PanierLignes.Include(l => l.Panier).FirstOrDefaultAsync(l => l.IdPanierLigne == idLigne) ?? throw ApiException.NotFound();
        if (ligne.Panier.IdPersonne != idPersonne) throw ApiException.Forbidden();
        db.PanierLignes.Remove(ligne);
        await db.SaveChangesAsync();
        return await GetAsync(idPersonne);
    }
}
