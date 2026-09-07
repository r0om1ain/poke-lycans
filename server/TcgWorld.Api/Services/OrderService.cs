using Microsoft.EntityFrameworkCore;
using TcgWorld.Api.Data;
using TcgWorld.Api.Data.Entities;
using TcgWorld.Api.Dtos;

namespace TcgWorld.Api.Services;

// datCommande — checkout transactionnel (consommation atomique d'une datOffrePrix
// EN_ATTENTE/ACCEPTEE, snapshot prix, décrément stock, vidage panier). Pas de
// ShippingMethod (supprimé) : livraison saisie plus tard par le vendeur via
// datExpedition. Pas de table Paiement dédiée : "pay" fait juste avancer le statut.
public class OrderService(AppDbContext db)
{
    private async Task<StatutCommande> StatutAsync(string code) =>
        await db.StatutsCommande.FirstOrDefaultAsync(s => s.StcCode == code)
        ?? throw new InvalidOperationException($"Statut de commande '{code}' non seedé");

    // Checkout du panier : une commande par vendeur (panier groupé par vendeur).
    public async Task<List<CommandeDto>> CheckoutAsync(int idAcheteur, CheckoutRequest req)
    {
        var panier = await db.Paniers.FirstOrDefaultAsync(p => p.IdPersonne == idAcheteur);
        if (panier is null) throw ApiException.BadRequest("Panier vide");
        var lignes = await db.PanierLignes.Where(l => l.IdPanier == panier.IdPanier)
            .Include(l => l.Annonce).ToListAsync();
        if (lignes.Count == 0) throw ApiException.BadRequest("Panier vide");

        var statutCree = await StatutAsync("CREEE");
        var commandes = new List<Commande>();

        await using var tx = await db.Database.BeginTransactionAsync();
        foreach (var groupe in lignes.GroupBy(l => l.Annonce.IdPersonne))
        {
            var idVendeur = groupe.Key;
            var commande = new Commande
            {
                IdAcheteur = idAcheteur,
                IdVendeur = idVendeur,
                IdStatutCommande = statutCree.IdStatutCommande,
                CmdAdresse = req.Adresse,
                CmdCodePostal = req.CodePostal,
                CmdVille = req.Ville,
                CmdPays = req.Pays,
            };

            decimal sousTotal = 0;
            foreach (var ligne in groupe)
            {
                var prixEffectif = ligne.Annonce.AnnPrix;

                // Consomme une offre de prix ACCEPTEE non expirée pour cette annonce+acheteur,
                // de façon atomique (ExecuteUpdateAsync conditionné sur le statut) — évite le
                // double-usage concurrent, comme orderModel.createOrderForSeller côté Node.
                var offreAcceptee = await db.OffresPrix
                    .Where(o => o.IdAnnonce == ligne.IdAnnonce && o.IdPersonneAcheteur == idAcheteur && o.OfrStatut == StatutOffrePrix.ACCEPTEE)
                    .Where(o => o.OfrDateExpiration == null || o.OfrDateExpiration > DateTime.UtcNow)
                    .OrderByDescending(o => o.OfrDateAcceptation)
                    .FirstOrDefaultAsync();
                if (offreAcceptee is not null)
                {
                    var nbMaj = await db.OffresPrix
                        .Where(o => o.IdOffrePrix == offreAcceptee.IdOffrePrix && o.OfrStatut == StatutOffrePrix.ACCEPTEE)
                        .ExecuteUpdateAsync(s => s.SetProperty(o => o.OfrStatut, StatutOffrePrix.UTILISEE).SetProperty(o => o.OfrDateUtilisation, DateTime.UtcNow));
                    if (nbMaj == 1) prixEffectif = offreAcceptee.OfrMontant;
                }

                var montantLigne = prixEffectif * ligne.PnlQuantite;
                sousTotal += montantLigne;
                commande.Lignes.Add(new CommandeLigne
                {
                    IdAnnonce = ligne.IdAnnonce,
                    CmlQuantite = ligne.PnlQuantite,
                    CmlPrixUnitaire = prixEffectif,
                    CmlMontantTotal = montantLigne,
                });

                var annonce = ligne.Annonce;
                annonce.AnnQuantite = Math.Max(annonce.AnnQuantite - ligne.PnlQuantite, 0);
                if (annonce.AnnQuantite <= 0) annonce.AnnStatut = AnnonceStatut.VENDUE;
            }

            commande.CmdMontantTotal = sousTotal;
            db.Commandes.Add(commande);
            commandes.Add(commande);
        }

        db.PanierLignes.RemoveRange(lignes);
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return [.. commandes.Select(MapDto)];
    }

    // Enchère remportée → commande directe (pas de panier, pas d'offre de prix,
    // un seul exemplaire donc pas de gestion de stock au-delà de l'annonce elle-même
    // puisqu'une enchère n'a pas d'annonce classique associée).
    public async Task<CommandeDto> CreerCommandeDepuisEnchereAsync(Enchere enchere, int idAcheteur, FinalizeAuctionRequest req)
    {
        var statutCree = await StatutAsync("CREEE");
        var commande = new Commande
        {
            IdAcheteur = idAcheteur,
            IdVendeur = enchere.IdPersonne,
            IdStatutCommande = statutCree.IdStatutCommande,
            CmdMontantTotal = enchere.EncPrixFinal ?? enchere.EncPrixDepart,
            CmdAdresse = req.Adresse,
            CmdCodePostal = req.CodePostal,
            CmdVille = req.Ville,
            CmdPays = req.Pays,
        };
        db.Commandes.Add(commande);
        await db.SaveChangesAsync();
        return MapDto(await db.Commandes.Include(c => c.Acheteur).Include(c => c.Vendeur).Include(c => c.StatutCommande)
            .Include(c => c.Lignes).FirstAsync(c => c.IdCommande == commande.IdCommande));
    }

    public async Task<List<CommandeDto>> PurchasesAsync(int idAcheteur, string? statutCode) =>
        [.. (await Filtered(db.Commandes.Where(c => c.IdAcheteur == idAcheteur), statutCode)).Select(MapDto)];

    public async Task<List<CommandeDto>> SalesAsync(int idVendeur, string? statutCode) =>
        [.. (await Filtered(db.Commandes.Where(c => c.IdVendeur == idVendeur), statutCode)).Select(MapDto)];

    private async Task<List<Commande>> Filtered(IQueryable<Commande> query, string? statutCode)
    {
        if (!string.IsNullOrEmpty(statutCode)) query = query.Where(c => c.StatutCommande.StcCode == statutCode);
        return await IncludeAll(query).OrderByDescending(c => c.CmdDateCreation).ToListAsync();
    }

    private static IQueryable<Commande> IncludeAll(IQueryable<Commande> q) => q
        .Include(c => c.Acheteur).Include(c => c.Vendeur).Include(c => c.StatutCommande)
        .Include(c => c.Lignes).ThenInclude(l => l.Annonce).ThenInclude(a => a.Carte!).ThenInclude(carte => carte.Serie)
        .Include(c => c.Lignes).ThenInclude(l => l.Annonce).ThenInclude(a => a.Item!).ThenInclude(item => item.Serie)
        .Include(c => c.Expedition);

    public async Task<CommandeDto> DetailAsync(int id, int idPersonne)
    {
        var commande = await IncludeAll(db.Commandes).FirstOrDefaultAsync(c => c.IdCommande == id) ?? throw ApiException.NotFound();
        if (commande.IdAcheteur != idPersonne && commande.IdVendeur != idPersonne) throw ApiException.Forbidden();
        return MapDto(commande);
    }

    public async Task<CommandeDto> PayAsync(int id, int idAcheteur)
    {
        var commande = await IncludeAll(db.Commandes).FirstOrDefaultAsync(c => c.IdCommande == id) ?? throw ApiException.NotFound();
        if (commande.IdAcheteur != idAcheteur) throw ApiException.Forbidden();
        if (commande.StatutCommande.StcCode != "CREEE") throw ApiException.Conflict("Commande déjà payée");
        commande.IdStatutCommande = (await StatutAsync("PAYEE")).IdStatutCommande;
        commande.CmdDateValidation = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return MapDto(await IncludeAll(db.Commandes).FirstAsync(c => c.IdCommande == id));
    }

    public async Task<CommandeDto> ShipAsync(int id, int idVendeur, ExpedierRequest req)
    {
        var commande = await db.Commandes.Include(c => c.Expedition).Include(c => c.StatutCommande).FirstOrDefaultAsync(c => c.IdCommande == id) ?? throw ApiException.NotFound();
        if (commande.IdVendeur != idVendeur) throw ApiException.Forbidden();
        if (commande.StatutCommande.StcCode != "PAYEE") throw ApiException.Conflict("Commande non payée");

        commande.Expedition = new Expedition
        {
            ExpTransporteur = req.Transporteur,
            ExpNumeroSuivi = req.NumeroSuivi,
            ExpModeLivraison = req.ModeLivraison,
            ExpFraisLivraison = req.Frais,
            ExpDateExpedition = DateTime.UtcNow,
            ExpStatut = ExpeditionStatut.EXPEDIEE,
        };
        commande.IdStatutCommande = (await StatutAsync("EXPEDIEE")).IdStatutCommande;
        commande.CmdDateExpedition = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return MapDto(await IncludeAll(db.Commandes).FirstAsync(c => c.IdCommande == id));
    }

    public async Task<CommandeDto> ReceiveAsync(int id, int idAcheteur)
    {
        var commande = await db.Commandes.Include(c => c.Expedition).Include(c => c.StatutCommande).FirstOrDefaultAsync(c => c.IdCommande == id) ?? throw ApiException.NotFound();
        if (commande.IdAcheteur != idAcheteur) throw ApiException.Forbidden();
        if (commande.StatutCommande.StcCode != "EXPEDIEE") throw ApiException.Conflict("Commande non expédiée");

        if (commande.Expedition is not null) { commande.Expedition.ExpStatut = ExpeditionStatut.LIVREE; commande.Expedition.ExpDateLivraison = DateTime.UtcNow; }
        commande.IdStatutCommande = (await StatutAsync("RECUE")).IdStatutCommande;
        commande.CmdDateReception = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return MapDto(await IncludeAll(db.Commandes).FirstAsync(c => c.IdCommande == id));
    }

    public async Task ReviewAsync(int id, int idAuteur, ReviewRequest req)
    {
        var commande = await db.Commandes.FirstOrDefaultAsync(c => c.IdCommande == id) ?? throw ApiException.NotFound();
        if (commande.IdAcheteur != idAuteur && commande.IdVendeur != idAuteur) throw ApiException.Forbidden();
        var idEvalue = commande.IdAcheteur == idAuteur ? commande.IdVendeur : commande.IdAcheteur;
        if (await db.Evaluations.AnyAsync(e => e.IdCommande == id && e.IdPersonneAuteur == idAuteur))
            throw ApiException.Conflict("Vous avez déjà évalué cette commande");
        if (req.Note is < 1 or > 5) throw ApiException.BadRequest("La note doit être comprise entre 1 et 5");

        db.Evaluations.Add(new Evaluation { IdCommande = id, IdPersonneAuteur = idAuteur, IdPersonneEvaluee = idEvalue, EvaNote = req.Note, EvaCommentaire = req.Commentaire });
        await db.SaveChangesAsync();
    }

    private static CommandeDto MapDto(Commande c) => new(
        c.IdCommande, VendeurResumeDto.From(c.Acheteur), VendeurResumeDto.From(c.Vendeur), c.StatutCommande.StcCode,
        c.CmdMontantTotal, c.CmdFraisLivraison, c.CmdFraisService,
        c.CmdAdresse, c.CmdCodePostal, c.CmdVille, c.CmdPays,
        [.. c.Lignes.Select(l => new CommandeLigneDto(
            l.IdCommandeLigne,
            l.Annonce.Carte is not null ? ProduitResumeDto.FromCarte(l.Annonce.Carte) : ProduitResumeDto.FromItem(l.Annonce.Item!),
            l.CmlQuantite, l.CmlPrixUnitaire, l.CmlMontantTotal))],
        c.Expedition is null ? null : ExpeditionDto.From(c.Expedition), c.CmdDateCreation);
}
