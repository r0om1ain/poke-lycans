using Microsoft.EntityFrameworkCore;
using TcgWorld.Api.Data;
using TcgWorld.Api.Data.Entities;
using TcgWorld.Api.Dtos;

namespace TcgWorld.Api.Services;

// Catalogue unifié Carte/Item (remplace l'ancien Product unique) : accueil, recherche,
// fiche produit, lookups.
public class CatalogService(AppDbContext db)
{
    public async Task<HomeDto> HomeAsync()
    {
        var depuis = DateTime.UtcNow.AddDays(-30);

        var tendancesCartes = await db.VuesRecentes
            .Where(v => v.IdCarte != null && v.VrcDateVue >= depuis)
            .GroupBy(v => v.IdCarte)
            .OrderByDescending(g => g.Count())
            .Take(10)
            .Select(g => g.Key!.Value)
            .ToListAsync();
        var cartesTendances = await db.Cartes.Include(c => c.Serie)
            .Where(c => tendancesCartes.Contains(c.IdCarte)).ToListAsync();
        var tendances = tendancesCartes
            .Select(id => cartesTendances.FirstOrDefault(c => c.IdCarte == id))
            .Where(c => c != null)
            .Select(c => ProduitResumeDto.FromCarte(c!))
            .ToList();

        var series = await db.Series.Include(s => s.Bloc)
            .OrderByDescending(s => s.SerDateSortie).Take(12)
            .Select(s => SerieDto.From(s)).ToListAsync();

        var bonnesAffaires = await db.Annonces
            .Where(a => a.AnnStatut == AnnonceStatut.ACTIVE && a.AnnQuantite > 0)
            .Include(a => a.Carte!).ThenInclude(c => c.Serie)
            .Include(a => a.Item!).ThenInclude(i => i.Serie)
            .OrderBy(a => a.AnnPrix).Take(30)
            .ToListAsync();
        var bonnesAffairesDto = DedupliquerProduits(bonnesAffaires);

        var encheres = await db.Encheres
            .Where(e => e.EncStatut == EnchereStatut.ACTIVE)
            .Include(e => e.Carte!).ThenInclude(c => c.Serie)
            .Include(e => e.Item!).ThenInclude(i => i.Serie)
            .Include(e => e.Mises)
            .OrderBy(e => e.EncDateFin).Take(8)
            .ToListAsync();

        return new HomeDto(tendances, series, bonnesAffairesDto, [.. encheres.Select(EnchereResumeDto.From)]);
    }

    private static List<ProduitResumeDto> DedupliquerProduits(List<Annonce> annonces)
    {
        var result = new List<ProduitResumeDto>();
        var seen = new HashSet<string>();
        foreach (var a in annonces)
        {
            string key;
            ProduitResumeDto dto;
            if (a.Carte is not null) { key = $"carte:{a.IdCarte}"; dto = ProduitResumeDto.FromCarte(a.Carte, a.AnnPrix); }
            else if (a.Item is not null) { key = $"item:{a.IdItem}"; dto = ProduitResumeDto.FromItem(a.Item, a.AnnPrix); }
            else continue;
            if (seen.Add(key)) result.Add(dto);
        }
        return result;
    }

    public async Task<SearchResultDto> SearchAsync(
        string type, string? q, int? idSerie, int? idBloc, int? idTypeItem,
        decimal? minPrice, decimal? maxPrice, bool availableOnly, int page, int pageSize)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);

        if (type == "item")
        {
            var query = db.Items.Include(i => i.Serie).ThenInclude(s => s.Bloc).Include(i => i.TypeItem)
                .Where(i => !i.ItmFlgArchive).AsQueryable();
            if (!string.IsNullOrWhiteSpace(q)) query = query.Where(i => EF.Functions.ILike(i.ItmNom, $"%{q}%"));
            if (idSerie is not null) query = query.Where(i => i.IdSerie == idSerie);
            if (idBloc is not null) query = query.Where(i => i.Serie.IdBloc == idBloc);
            if (idTypeItem is not null) query = query.Where(i => i.IdTypeItem == idTypeItem);

            var total = await query.CountAsync();
            var items = await query.OrderBy(i => i.ItmNom).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            var prixParItem = await PrixMinParItem([.. items.Select(i => i.IdItem)]);
            return new SearchResultDto(
                [.. items.Select(i => ProduitResumeDto.FromItem(i, prixParItem.GetValueOrDefault(i.IdItem)))],
                total, page, pageSize);
        }
        else
        {
            var query = db.Cartes.Include(c => c.Serie).ThenInclude(s => s.Bloc)
                .Where(c => !c.CrtFlgArchive).AsQueryable();
            if (!string.IsNullOrWhiteSpace(q)) query = query.Where(c => EF.Functions.ILike(c.CrtNom, $"%{q}%"));
            if (idSerie is not null) query = query.Where(c => c.IdSerie == idSerie);
            if (idBloc is not null) query = query.Where(c => c.Serie.IdBloc == idBloc);

            var total = await query.CountAsync();
            var cartes = await query.OrderBy(c => c.CrtNom).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            var prixParCarte = await PrixMinParCarte([.. cartes.Select(c => c.IdCarte)]);

            var resultats = cartes.Select(c => ProduitResumeDto.FromCarte(c, prixParCarte.GetValueOrDefault(c.IdCarte)));
            if (availableOnly) resultats = resultats.Where(r => r.PrixMin != null);
            if (minPrice is not null) resultats = resultats.Where(r => r.PrixMin is null || r.PrixMin >= minPrice);
            if (maxPrice is not null) resultats = resultats.Where(r => r.PrixMin is null || r.PrixMin <= maxPrice);

            return new SearchResultDto([.. resultats], total, page, pageSize);
        }
    }

    private async Task<Dictionary<int, decimal>> PrixMinParCarte(List<int> ids) =>
        await db.Annonces.Where(a => a.AnnStatut == AnnonceStatut.ACTIVE && a.IdCarte != null && ids.Contains(a.IdCarte!.Value))
            .GroupBy(a => a.IdCarte!.Value).Select(g => new { Id = g.Key, Prix = g.Min(a => a.AnnPrix) })
            .ToDictionaryAsync(x => x.Id, x => x.Prix);

    private async Task<Dictionary<int, decimal>> PrixMinParItem(List<int> ids) =>
        await db.Annonces.Where(a => a.AnnStatut == AnnonceStatut.ACTIVE && a.IdItem != null && ids.Contains(a.IdItem!.Value))
            .GroupBy(a => a.IdItem!.Value).Select(g => new { Id = g.Key, Prix = g.Min(a => a.AnnPrix) })
            .ToDictionaryAsync(x => x.Id, x => x.Prix);

    public async Task<CarteDetailDto> CarteDetailAsync(int id)
    {
        var carte = await db.Cartes.Include(c => c.Serie).ThenInclude(s => s.Bloc)
            .FirstOrDefaultAsync(c => c.IdCarte == id) ?? throw ApiException.NotFound("Carte introuvable");
        return CarteDetail(carte);
    }

    public async Task<CarteDetailDto> CarteDetailBySlugAsync(string serieCode, string slug)
    {
        var cartes = await db.Cartes.Include(c => c.Serie).ThenInclude(s => s.Bloc)
            .Where(c => c.Serie.SerCode == serieCode).ToListAsync();
        var carte = cartes.FirstOrDefault(c => SlugHelper.CarteSlug(c) == slug) ?? throw ApiException.NotFound("Carte introuvable");
        return CarteDetail(carte);
    }

    private static CarteDetailDto CarteDetail(Carte c) => new(
        c.IdCarte, c.CrtNom, c.CrtNumero, c.CrtCode, c.CrtNumeroSerie, c.CrtRarete, c.CrtImage,
        SerieDto.From(c.Serie), SlugHelper.CarteSlug(c));

    public async Task<ItemDetailDto> ItemDetailAsync(int id)
    {
        var item = await db.Items.Include(i => i.Serie).ThenInclude(s => s.Bloc).Include(i => i.TypeItem)
            .FirstOrDefaultAsync(i => i.IdItem == id) ?? throw ApiException.NotFound("Produit introuvable");
        return ItemDetail(item);
    }

    public async Task<ItemDetailDto> ItemDetailBySlugAsync(string serieCode, string slug)
    {
        var items = await db.Items.Include(i => i.Serie).ThenInclude(s => s.Bloc).Include(i => i.TypeItem)
            .Where(i => i.Serie.SerCode == serieCode).ToListAsync();
        var item = items.FirstOrDefault(i => SlugHelper.ItemSlug(i) == slug) ?? throw ApiException.NotFound("Produit introuvable");
        return ItemDetail(item);
    }

    private static ItemDetailDto ItemDetail(Item i) => new(
        i.IdItem, i.ItmNom, i.ItmNumero, i.ItmImage, SerieDto.From(i.Serie), TypeItemDto.From(i.TypeItem), SlugHelper.ItemSlug(i));

    public async Task<List<SerieDto>> SeriesAsync() =>
        [.. (await db.Series.Include(s => s.Bloc).OrderBy(s => s.SerNom).ToListAsync()).Select(SerieDto.From)];

    public async Task<List<BlocDto>> BlocsAsync() =>
        [.. (await db.Blocs.Include(b => b.Series).OrderBy(b => b.BlcNom).ToListAsync()).Select(BlocDto.From)];

    public async Task<List<TypeItemDto>> TypesItemAsync() =>
        [.. (await db.TypesItem.Where(t => !t.TypFlgArchive).OrderBy(t => t.TypNom).ToListAsync()).Select(TypeItemDto.From)];

    public async Task<List<LangueDto>> LanguesAsync() =>
        [.. (await db.Langues.Where(l => !l.LngFlgArchive).OrderBy(l => l.LngNom).ToListAsync()).Select(LangueDto.From)];

    public async Task<List<SocieteGradationDto>> SocietesGradationAsync() =>
        [.. (await db.SocietesGradation.Where(s => !s.SgrFlgArchive).OrderBy(s => s.SgrNom).ToListAsync()).Select(SocieteGradationDto.From)];

    public async Task<List<string>> RaretesAsync() =>
        await db.Cartes.Where(c => c.CrtRarete != null).Select(c => c.CrtRarete!).Distinct().OrderBy(r => r).ToListAsync();
}
