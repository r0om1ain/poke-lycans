using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using TcgWorld.Api.Data;
using TcgWorld.Api.Data.Entities;
using TcgWorld.Api.Dtos;
using TcgWorld.Api.Hubs;

namespace TcgWorld.Api.Services;

// datEnchere — pas de colonne "prix courant" : déduit de la meilleure datMiseEnchere
// (ou EncPrixDepart si aucune mise). EncPrixFinal n'est renseigné qu'à la clôture.
public class AuctionService(AppDbContext db, UploadHelper upload, OrderService orders, IHubContext<AuctionsHub> hub)
{
    private static IQueryable<Enchere> IncludeAll(IQueryable<Enchere> q) => q
        .Include(e => e.Personne)
        .Include(e => e.PersonneGagnant)
        .Include(e => e.Carte!).ThenInclude(c => c.Serie)
        .Include(e => e.Item!).ThenInclude(i => i.Serie)
        .Include(e => e.EnchereCarte!).ThenInclude(ec => ec.SocieteGradation)
        .Include(e => e.Photos)
        .Include(e => e.Mises).ThenInclude(m => m.Personne);

    public async Task<List<EnchereResumeDto>> ListAsync(int? idSerie, int page, int pageSize)
    {
        var query = IncludeAll(db.Encheres).Where(e => e.EncStatut == EnchereStatut.ACTIVE);
        if (idSerie is not null) query = query.Where(e => (e.Carte != null && e.Carte.IdSerie == idSerie) || (e.Item != null && e.Item.IdSerie == idSerie));
        var encheres = await query.OrderBy(e => e.EncDateFin).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        return [.. encheres.Select(EnchereResumeDto.From)];
    }

    public async Task<EnchereDetailDto> DetailAsync(int id)
    {
        var enchere = await IncludeAll(db.Encheres).FirstOrDefaultAsync(e => e.IdEnchere == id)
            ?? throw ApiException.NotFound("Enchère introuvable");
        return EnchereDetailDto.From(enchere);
    }

    public async Task<List<EnchereResumeDto>> MineAsync(int idPersonne)
    {
        var encheres = await IncludeAll(db.Encheres)
            .Where(e => e.IdPersonne == idPersonne || e.Mises.Any(m => m.IdPersonne == idPersonne))
            .OrderByDescending(e => e.EncDateCreation).ToListAsync();
        return [.. encheres.Select(EnchereResumeDto.From)];
    }

    public async Task<EnchereDetailDto> CreateAsync(int idPersonne, CreateEnchereRequest req, List<IFormFile>? photos)
    {
        if (req.IdCarte is null && req.IdItem is null) throw ApiException.BadRequest("idCarte ou idItem requis");
        if (req.PrixDepart <= 0) throw ApiException.BadRequest("Le prix de départ doit être positif");
        var duree = Math.Clamp(req.DureeJours, 1, 7); // durée max 7j (specs d'origine)

        var enchere = new Enchere
        {
            IdPersonne = idPersonne,
            IdCarte = req.IdCarte,
            IdItem = req.IdItem,
            IdLangue = req.IdLangue,
            EncDescription = req.Description,
            EncPrixDepart = req.PrixDepart,
            EncPrixReserve = req.PrixReserve,
            EncDateDebut = DateTime.UtcNow,
            EncDateFin = DateTime.UtcNow.AddDays(duree),
            EncStatut = EnchereStatut.ACTIVE,
        };

        if (req.IdCarte is not null)
        {
            var carac = new CaracteristiquesCarte(
                ParseEtat(req.Etat), req.IdLangue, req.Holo, req.Edition1, req.Pokeball,
                req.Misscut, req.Missprint, req.Stamp, req.Reverse, req.Grade, req.IdSocieteGradation, req.NoteGradation);
            var ec = new EnchereCarte();
            CaracteristiquesHelper.AppliquerEnchereCarte(ec, carac);
            enchere.EnchereCarte = ec;
        }

        if (photos is { Count: > 0 })
        {
            var ordre = 0;
            foreach (var photo in photos)
            {
                var chemin = await upload.SaveAsync(photo, "encheres");
                enchere.Photos.Add(new PhotoEnchere { PheChemin = chemin, PheOrdre = ordre, PheFlgPrincipale = ordre == 0 });
                ordre++;
            }
        }

        db.Encheres.Add(enchere);
        await db.SaveChangesAsync();
        return EnchereDetailDto.From(await IncludeAll(db.Encheres).FirstAsync(e => e.IdEnchere == enchere.IdEnchere));
    }

    private static EtatCarte? ParseEtat(string? etat) =>
        !string.IsNullOrEmpty(etat) && Enum.TryParse<EtatCarte>(etat, true, out var e) ? e : null;

    // AUCTION_NOT_FOUND / AUCTION_NOT_ACTIVE / AUCTION_ENDED / BID_TOO_LOW — mêmes
    // règles que l'ancien auctionModel.placeBid, prix courant déduit de la meilleure mise.
    public async Task<EnchereDetailDto> PlaceBidAsync(int idEnchere, int idPersonne, decimal montant)
    {
        await using var tx = await db.Database.BeginTransactionAsync();
        var enchere = await db.Encheres.Include(e => e.Mises).FirstOrDefaultAsync(e => e.IdEnchere == idEnchere)
            ?? throw ApiException.NotFound("Enchère introuvable");
        if (enchere.EncStatut != EnchereStatut.ACTIVE) throw ApiException.Conflict("Enchère non active");
        if (enchere.EncDateFin <= DateTime.UtcNow) throw ApiException.Conflict("Enchère terminée");

        var prixCourant = enchere.Mises.Count > 0 ? enchere.Mises.Max(m => m.MisMontant) : enchere.EncPrixDepart;
        if (montant <= prixCourant) throw ApiException.Conflict("Le montant doit être supérieur au prix courant");

        db.MisesEnchere.Add(new MiseEnchere { IdEnchere = idEnchere, IdPersonne = idPersonne, MisMontant = montant, MisDate = DateTime.UtcNow });
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        var detail = await DetailAsync(idEnchere);
        await hub.Clients.Group(AuctionsHub.GroupName(idEnchere.ToString())).SendAsync("bidPlaced", detail);
        return detail;
    }

    // Transforme une enchère remportée en commande — l'acheteur choisit son adresse
    // de livraison (pas de mode de livraison prédéfini, ShippingMethod supprimé).
    public async Task<object> FinalizeAsync(int idEnchere, int idPersonne, FinalizeAuctionRequest req)
    {
        var enchere = await db.Encheres.FirstOrDefaultAsync(e => e.IdEnchere == idEnchere)
            ?? throw ApiException.NotFound("Enchère introuvable");
        if (enchere.EncStatut != EnchereStatut.TERMINEE) throw ApiException.Conflict("Enchère non terminée");
        if (enchere.IdPersonneGagnant != idPersonne) throw ApiException.Forbidden("Vous n'avez pas remporté cette enchère");

        return await orders.CreerCommandeDepuisEnchereAsync(enchere, idPersonne, req);
    }
}
