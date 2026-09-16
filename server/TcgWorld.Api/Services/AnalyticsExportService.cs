using Microsoft.EntityFrameworkCore;
using TcgWorld.Api.Data;
using TcgWorld.Api.Data.Entities;
using TcgWorld.Api.Dtos;

namespace TcgWorld.Api.Services;

// Source de données pour le pipeline ELT (remplace l'API Flask simulée du cahier des
// charges "MarketPlace Analytics") : lecture seule sur les vraies données TCGWorld,
// consommée par MarketplaceAPIHook côté Airflow. Ne doit jamais muter l'état de l'app.
public class AnalyticsExportService(AppDbContext db)
{
    public async Task<List<ExportOrderDto>> GetOrdersAsync(DateOnly date)
    {
        var start = DateTime.SpecifyKind(date.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);
        var end = start.AddDays(1);

        var commandes = await db.Commandes.AsNoTracking()
            .Where(c => !c.CmdFlgArchive && c.CmdDateCreation >= start && c.CmdDateCreation < end)
            .Include(c => c.StatutCommande)
            .Include(c => c.Lignes).ThenInclude(l => l.Annonce).ThenInclude(a => a.Carte)
            .Include(c => c.Lignes).ThenInclude(l => l.Annonce).ThenInclude(a => a.Item).ThenInclude(i => i!.TypeItem)
            .OrderBy(c => c.IdCommande)
            .ToListAsync();

        return [.. commandes.Select(c => new ExportOrderDto(
            c.IdCommande, date, c.IdVendeur, c.IdAcheteur, c.StatutCommande.StcCode,
            c.CmdMontantTotal, c.CmdFraisLivraison, c.CmdFraisService,
            [.. c.Lignes.Select(l => ToLineDto(l))]))];
    }

    private static ExportOrderLineDto ToLineDto(CommandeLigne l)
    {
        var annonce = l.Annonce;
        var (productType, productId, productName, category) = annonce.Carte is not null
            ? ("carte", annonce.Carte.IdCarte, annonce.Carte.CrtNom, "Carte")
            : ("item", annonce.Item!.IdItem, annonce.Item!.ItmNom, annonce.Item!.TypeItem.TypNom);

        return new ExportOrderLineDto(annonce.IdAnnonce, productType, productId, productName, category,
            l.CmlQuantite, l.CmlPrixUnitaire, l.CmlMontantTotal);
    }

    // "Vendeur" = toute Personne ayant publié au moins une annonce (pas de flag dédié sur
    // PrsRole, voir Data/Entities/Personne.cs).
    public async Task<List<ExportSellerDto>> GetSellersAsync(int? limit)
    {
        var sellerIds = await db.Annonces.AsNoTracking()
            .Select(a => a.IdPersonne).Distinct().ToListAsync();

        var query = db.Personnes.AsNoTracking()
            .Where(p => sellerIds.Contains(p.IdPersonne))
            .OrderBy(p => p.IdPersonne)
            .AsQueryable();

        if (limit is > 0) query = query.Take(limit.Value);

        var vendeurs = await query.ToListAsync();
        return [.. vendeurs.Select(p => new ExportSellerDto(p.IdPersonne, p.PrsPseudo, p.PrsPays, p.PrsDateCreation))];
    }

    // Le "produit" exporté est la fiche catalogue (Carte/Item), pas l'annonce : c'est cet
    // id que CommandeLigne référence indirectement (via Annonce -> Carte/Item), donc celui
    // que dwh.fact_orders.product_id doit pouvoir résoudre côté dwh.dim_product. Un même
    // produit catalogue pouvant être vendu par plusieurs vendeurs, on déduplique par id
    // catalogue (une seule ligne par clé, sinon l'upsert Airflow ON CONFLICT échoue sur des
    // doublons dans le même batch) ; seller_id devient alors indicatif (dernière annonce
    // active vue), l'attribution réelle par vente restant sur fact_orders.seller_id.
    public async Task<List<ExportProductDto>> GetProductsAsync(int? limit)
    {
        var annonces = await db.Annonces.AsNoTracking()
            .Where(a => a.AnnStatut == AnnonceStatut.ACTIVE)
            .Include(a => a.Carte)
            .Include(a => a.Item).ThenInclude(i => i!.TypeItem)
            .OrderByDescending(a => a.AnnDateCreation)
            .ToListAsync();

        var produits = annonces
            .Select(a =>
            {
                var (catalogId, name, category) = a.Carte is not null
                    ? (a.Carte.IdCarte, a.Carte.CrtNom, "Carte")
                    : (a.Item!.IdItem, a.Item!.ItmNom, a.Item!.TypeItem.TypNom);
                return new ExportProductDto(catalogId, name, category, a.IdPersonne, a.AnnPrix);
            })
            .GroupBy(p => p.ProductId)
            .Select(g => g.First())
            .OrderBy(p => p.ProductId)
            .AsEnumerable();

        if (limit is > 0) produits = produits.Take(limit.Value);
        return [.. produits];
    }
}
