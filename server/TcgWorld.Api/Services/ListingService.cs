using Microsoft.EntityFrameworkCore;
using TcgWorld.Api.Data;
using TcgWorld.Api.Data.Entities;
using TcgWorld.Api.Dtos;

namespace TcgWorld.Api.Services;

// datAnnonce — annonces de vente classiques (remplace Listing).
public class ListingService(AppDbContext db, UploadHelper upload)
{
    private static IQueryable<Annonce> IncludeAll(IQueryable<Annonce> q) => q
        .Include(a => a.Personne)
        .Include(a => a.Carte!).ThenInclude(c => c.Serie)
        .Include(a => a.Item!).ThenInclude(i => i.Serie)
        .Include(a => a.AnnonceCarte!).ThenInclude(ac => ac.SocieteGradation)
        .Include(a => a.Photos);

    public async Task<AnnonceDto> CreateAsync(int idPersonne, CreateAnnonceRequest req, List<IFormFile>? photos)
    {
        if (req.IdCarte is null && req.IdItem is null) throw ApiException.BadRequest("idCarte ou idItem requis");
        if (req.Prix <= 0) throw ApiException.BadRequest("Le prix doit être positif");

        var annonce = new Annonce
        {
            IdPersonne = idPersonne,
            IdCarte = req.IdCarte,
            IdItem = req.IdItem,
            IdLangue = req.IdLangue,
            AnnPrix = req.Prix,
            AnnQuantite = Math.Max(req.Quantite, 1),
            AnnDescription = req.Description,
            AnnStatut = AnnonceStatut.ACTIVE,
        };

        if (req.IdCarte is not null)
        {
            var carac = new CaracteristiquesCarte(
                ParseEtat(req.Etat), req.IdLangue, req.Holo, req.Edition1, req.Pokeball,
                req.Misscut, req.Missprint, req.Stamp, req.Reverse, req.Grade, req.IdSocieteGradation, req.NoteGradation);
            var ac = new AnnonceCarte();
            CaracteristiquesHelper.AppliquerAnnonceCarte(ac, carac);
            annonce.AnnonceCarte = ac;
        }

        if (photos is { Count: > 0 })
        {
            var ordre = 0;
            foreach (var photo in photos)
            {
                var chemin = await upload.SaveAsync(photo, "annonces");
                annonce.Photos.Add(new PhotoAnnonce { PhoChemin = chemin, PhoOrdre = ordre, PhoFlgPrincipale = ordre == 0 });
                ordre++;
            }
        }

        db.Annonces.Add(annonce);
        await db.SaveChangesAsync();
        return AnnonceDto.From(await IncludeAll(db.Annonces).FirstAsync(a => a.IdAnnonce == annonce.IdAnnonce));
    }

    private static EtatCarte? ParseEtat(string? etat) =>
        !string.IsNullOrEmpty(etat) && Enum.TryParse<EtatCarte>(etat, true, out var e) ? e : null;

    public async Task<AnnonceDto> UpdateAsync(int idAnnonce, int idPersonne, UpdateAnnonceRequest req)
    {
        var annonce = await IncludeAll(db.Annonces).FirstOrDefaultAsync(a => a.IdAnnonce == idAnnonce)
            ?? throw ApiException.NotFound("Annonce introuvable");
        if (annonce.IdPersonne != idPersonne) throw ApiException.Forbidden();

        if (req.Prix is not null) annonce.AnnPrix = req.Prix.Value;
        if (req.Quantite is not null) annonce.AnnQuantite = req.Quantite.Value;
        if (req.Description is not null) annonce.AnnDescription = req.Description;
        if (req.Statut is not null && Enum.TryParse<AnnonceStatut>(req.Statut, true, out var statut)) annonce.AnnStatut = statut;
        annonce.AnnDateModification = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return AnnonceDto.From(annonce);
    }

    public async Task RemoveAsync(int idAnnonce, int idPersonne)
    {
        var annonce = await db.Annonces.FindAsync(idAnnonce) ?? throw ApiException.NotFound("Annonce introuvable");
        if (annonce.IdPersonne != idPersonne) throw ApiException.Forbidden();
        annonce.AnnStatut = AnnonceStatut.SUPPRIMEE;
        annonce.AnnDateModification = DateTime.UtcNow;
        await db.SaveChangesAsync();
    }

    // Annonces disponibles pour un produit donné, triées par prix croissant — filtre
    // en seuil sur l'état (AuMoinsAussiBonQue), comme buildExemplarWhere côté Node.
    public async Task<List<AnnonceDto>> ForProduitAsync(int? idCarte, int? idItem, string? etatMin, int? idLangue, bool? holo, bool? edition1, bool? graded)
    {
        var query = IncludeAll(db.Annonces).Where(a => a.AnnStatut == AnnonceStatut.ACTIVE && a.AnnQuantite > 0);
        query = idCarte is not null ? query.Where(a => a.IdCarte == idCarte) : query.Where(a => a.IdItem == idItem);
        if (idLangue is not null) query = query.Where(a => a.IdLangue == idLangue);
        if (holo is not null) query = query.Where(a => a.AnnonceCarte!.AncFlgHolo == holo);
        if (edition1 is not null) query = query.Where(a => a.AnnonceCarte!.AncFlgEdition1 == edition1);
        if (graded is not null) query = query.Where(a => a.AnnonceCarte!.AncFlgGrade == graded);

        var annonces = await query.OrderBy(a => a.AnnPrix).ToListAsync();
        if (!string.IsNullOrEmpty(etatMin) && Enum.TryParse<EtatCarte>(etatMin, true, out var min))
        {
            var seuil = CaracteristiquesHelper.AuMoinsAussiBonQue(min);
            annonces = [.. annonces.Where(a => a.AnnonceCarte is null || (a.AnnonceCarte.AncEtat is not null && seuil.Contains(a.AnnonceCarte.AncEtat.Value)))];
        }
        return [.. annonces.Select(AnnonceDto.From)];
    }

    public async Task<List<AnnonceDto>> MineAsync(int idPersonne, int? idTypeItem, int? idSerie)
    {
        var query = IncludeAll(db.Annonces).Where(a => a.IdPersonne == idPersonne && a.AnnStatut != AnnonceStatut.SUPPRIMEE);
        if (idTypeItem is not null) query = query.Where(a => a.Item != null && a.Item.IdTypeItem == idTypeItem);
        if (idSerie is not null) query = query.Where(a => (a.Carte != null && a.Carte.IdSerie == idSerie) || (a.Item != null && a.Item.IdSerie == idSerie));
        var annonces = await query.OrderByDescending(a => a.AnnDateCreation).ToListAsync();
        return [.. annonces.Select(AnnonceDto.From)];
    }

    // Compte les annonces actives d'un vendeur groupées par type d'item — équivalent
    // de countsByCategoryForSeller, en projetant bien IdTypeItem (bug corrigé côté
    // Node à ne pas réintroduire : l'id doit être présent, pas que le libellé).
    public async Task<List<FacetCategorieDto>> FacetsForSellerAsync(int idPersonne)
    {
        var actives = await db.Annonces
            .Where(a => a.IdPersonne == idPersonne && a.AnnStatut == AnnonceStatut.ACTIVE)
            .Include(a => a.Item!).ThenInclude(i => i.TypeItem)
            .ToListAsync();

        var cartesCount = actives.Count(a => a.IdCarte != null);
        var result = new List<FacetCategorieDto>();
        if (cartesCount > 0) result.Add(new FacetCategorieDto(null, "Cartes", cartesCount));
        result.AddRange(actives.Where(a => a.Item != null)
            .GroupBy(a => a.Item!.IdTypeItem)
            .Select(g => new FacetCategorieDto(g.Key, g.First().Item!.TypeItem.TypNom, g.Count())));
        return result;
    }

    public async Task<List<AnnonceDto>> ForSellerPublicAsync(int idPersonne, int? idTypeItem)
    {
        var query = IncludeAll(db.Annonces).Where(a => a.IdPersonne == idPersonne && a.AnnStatut == AnnonceStatut.ACTIVE);
        if (idTypeItem is not null) query = query.Where(a => a.Item != null && a.Item.IdTypeItem == idTypeItem);
        var annonces = await query.OrderByDescending(a => a.AnnDateCreation).ToListAsync();
        return [.. annonces.Select(AnnonceDto.From)];
    }
}
