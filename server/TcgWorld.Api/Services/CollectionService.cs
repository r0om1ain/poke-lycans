using Microsoft.EntityFrameworkCore;
using TcgWorld.Api.Data;
using TcgWorld.Api.Data.Entities;
using TcgWorld.Api.Dtos;

namespace TcgWorld.Api.Services;

public class CollectionService(AppDbContext db, PricingService pricing, ListingService listings)
{
    private async Task<Collection> GetOrCreateAsync(int idPersonne)
    {
        var collection = await db.Collections.FirstOrDefaultAsync(c => c.IdPersonne == idPersonne);
        if (collection is not null) return collection;
        collection = new Collection { IdPersonne = idPersonne };
        db.Collections.Add(collection);
        await db.SaveChangesAsync();
        return collection;
    }

    public async Task<(List<CollectionCarteDto> Cartes, List<CollectionItemDto> Items)> ListAsync(int idPersonne, int? idSerie)
    {
        var collection = await GetOrCreateAsync(idPersonne);
        IQueryable<CollectionCarte> cartesQuery = db.CollectionsCarte.Where(c => c.IdCollection == collection.IdCollection)
            .Include(c => c.Carte).ThenInclude(c => c.Serie);
        IQueryable<CollectionItem> itemsQuery = db.CollectionsItem.Where(c => c.IdCollection == collection.IdCollection)
            .Include(c => c.Item).ThenInclude(i => i.Serie);
        if (idSerie is not null)
        {
            cartesQuery = cartesQuery.Where(c => c.Carte.IdSerie == idSerie);
            itemsQuery = itemsQuery.Where(c => c.Item.IdSerie == idSerie);
        }
        var cartes = await cartesQuery.OrderByDescending(c => c.ColcDateAjout).ToListAsync();
        var items = await itemsQuery.OrderByDescending(c => c.CliDateAjout).ToListAsync();
        return ([.. cartes.Select(CollectionCarteDto.From)], [.. items.Select(CollectionItemDto.From)]);
    }

    public async Task<CollectionCarteDto> AddCarteAsync(int idPersonne, AddCollectionCarteRequest req)
    {
        var collection = await GetOrCreateAsync(idPersonne);
        var carac = new CaracteristiquesCarte(
            ParseEtat(req.Etat), req.IdLangue, req.Holo, req.Edition1, req.Pokeball,
            req.Misscut, req.Missprint, req.Stamp, req.Reverse, req.Grade, req.IdSocieteGradation, req.NoteGradation);
        var item = new CollectionCarte { IdCollection = collection.IdCollection, IdCarte = req.IdCarte, IdLangue = req.IdLangue, ColcQuantite = Math.Max(req.Quantite, 1) };
        CaracteristiquesHelper.AppliquerCollectionCarte(item, carac);
        db.CollectionsCarte.Add(item);
        await db.SaveChangesAsync();
        return CollectionCarteDto.From(await db.CollectionsCarte.Include(c => c.Carte).ThenInclude(c => c.Serie).FirstAsync(c => c.IdCollectionCarte == item.IdCollectionCarte));
    }

    private static EtatCarte? ParseEtat(string? etat) =>
        !string.IsNullOrEmpty(etat) && Enum.TryParse<EtatCarte>(etat, true, out var e) ? e : null;

    public async Task<CollectionItemDto> AddItemAsync(int idPersonne, AddCollectionItemRequest req)
    {
        var collection = await GetOrCreateAsync(idPersonne);
        var item = new CollectionItem { IdCollection = collection.IdCollection, IdItem = req.IdItem, IdLangue = req.IdLangue, CliQuantite = Math.Max(req.Quantite, 1), CliEtat = req.Etat };
        db.CollectionsItem.Add(item);
        await db.SaveChangesAsync();
        return CollectionItemDto.From(await db.CollectionsItem.Include(c => c.Item).ThenInclude(i => i.Serie).FirstAsync(c => c.IdCollectionItem == item.IdCollectionItem));
    }

    public async Task<CollectionCarteDto> UpdateCarteAsync(int id, int idPersonne, UpdateCollectionCarteRequest req)
    {
        var item = await db.CollectionsCarte.Include(c => c.Collection).Include(c => c.Carte).ThenInclude(c => c.Serie)
            .FirstOrDefaultAsync(c => c.IdCollectionCarte == id) ?? throw ApiException.NotFound();
        if (item.Collection.IdPersonne != idPersonne) throw ApiException.Forbidden();
        if (req.Quantite is not null) item.ColcQuantite = req.Quantite.Value;
        item.ColcDateModification = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return CollectionCarteDto.From(item);
    }

    public async Task RemoveCarteAsync(int id, int idPersonne)
    {
        var item = await db.CollectionsCarte.Include(c => c.Collection).FirstOrDefaultAsync(c => c.IdCollectionCarte == id) ?? throw ApiException.NotFound();
        if (item.Collection.IdPersonne != idPersonne) throw ApiException.Forbidden();
        db.CollectionsCarte.Remove(item);
        await db.SaveChangesAsync();
    }

    public async Task<EstimationDto?> EstimateAsync(int id, int idPersonne)
    {
        var item = await db.CollectionsCarte.Include(c => c.Collection).FirstOrDefaultAsync(c => c.IdCollectionCarte == id) ?? throw ApiException.NotFound();
        if (item.Collection.IdPersonne != idPersonne) throw ApiException.Forbidden();
        var carac = new CaracteristiquesCarte(item.ColcEtat, item.IdLangue, item.ColcFlgHolo, item.ColcFlgEdition1, item.ColcFlgPokeball,
            item.ColcFlgMisscut, item.ColcFlgMissprint, item.ColcFlgStamp, item.ColcFlgReverse, item.ColcFlgGrade, item.IdSocieteGradation, item.ColcNoteGradation);
        return await pricing.EstimateAsync(item.IdCarte, carac);
    }

    public async Task<ValeurTotaleDto> TotalValueAsync(int idPersonne)
    {
        var collection = await GetOrCreateAsync(idPersonne);
        var items = await db.CollectionsCarte.Where(c => c.IdCollection == collection.IdCollection).ToListAsync();
        decimal total = 0; var estimes = 0;
        foreach (var item in items)
        {
            var carac = new CaracteristiquesCarte(item.ColcEtat, item.IdLangue, item.ColcFlgHolo, item.ColcFlgEdition1, item.ColcFlgPokeball,
                item.ColcFlgMisscut, item.ColcFlgMissprint, item.ColcFlgStamp, item.ColcFlgReverse, item.ColcFlgGrade, item.IdSocieteGradation, item.ColcNoteGradation);
            var estimation = await pricing.EstimateAsync(item.IdCarte, carac);
            if (estimation?.Estime is not null) { total += estimation.Estime.Value * item.ColcQuantite; estimes++; }
        }
        return new ValeurTotaleDto(Math.Round(total, 2), estimes, items.Count);
    }

    public async Task<AnnonceDto> SellAsync(int id, int idPersonne, SellFromCollectionRequest req)
    {
        var item = await db.CollectionsCarte.Include(c => c.Collection).FirstOrDefaultAsync(c => c.IdCollectionCarte == id) ?? throw ApiException.NotFound();
        if (item.Collection.IdPersonne != idPersonne) throw ApiException.Forbidden();

        var createReq = new CreateAnnonceRequest(
            item.IdCarte, null, item.IdLangue, req.Prix, req.Quantite, req.Description,
            item.ColcEtat?.ToString(), item.ColcFlgHolo, item.ColcFlgEdition1, item.ColcFlgPokeball,
            item.ColcFlgMisscut, item.ColcFlgMissprint, item.ColcFlgStamp, item.ColcFlgReverse, item.ColcFlgGrade,
            item.IdSocieteGradation, item.ColcNoteGradation);
        return await listings.CreateAsync(idPersonne, createReq, null);
    }
}
