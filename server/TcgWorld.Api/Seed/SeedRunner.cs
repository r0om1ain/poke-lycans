using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TcgWorld.Api.Data;
using TcgWorld.Api.Data.Entities;

namespace TcgWorld.Api.Seed;

// Port C# de server-legacy-node/prisma/seed/*.js. Idempotent (upserts par clé
// naturelle). Cartes réelles via l'API TCGdex, produits scellés déjà téléchargés
// dans wwwroot/uploads/products (réutilisés, pas re-téléchargés si présents).
public class SeedRunner(AppDbContext db, IHttpClientFactory httpFactory, IWebHostEnvironment env, ILogger<SeedRunner> logger)
{
    private record SeedSet(string TcgdexId, string Code, string Name);
    private record SealedProduct(string Slug, string Name, string CategorySlug, string SeriesCode, string WikiDomain, string WikiFile);

    public async Task RunAsync()
    {
        await SeedLookupsAsync();
        var blocsParPrefixe = await SeedBlocsAsync();
        await SeedCartesAsync(blocsParPrefixe);
        await SeedProduitsScellesAsync();
        logger.LogInformation("Seed terminé.");
    }

    private async Task SeedLookupsAsync()
    {
        await UpsertLangue("fr", "Français"); await UpsertLangue("en", "Anglais"); await UpsertLangue("jp", "Japonais");
        await UpsertSociete("PSA"); await UpsertSociete("PCA"); await UpsertSociete("BGS"); await UpsertSociete("CGC"); await UpsertSociete("ACE");
        await UpsertTypeItem("etb", "ETB"); await UpsertTypeItem("display", "Display"); await UpsertTypeItem("coffret", "Coffret"); await UpsertTypeItem("booster", "Booster");
        await UpsertStatut("CREEE", "Créée", 1); await UpsertStatut("PAYEE", "Payée", 2); await UpsertStatut("EXPEDIEE", "Expédiée", 3); await UpsertStatut("RECUE", "Reçue", 4);
        await db.SaveChangesAsync();
    }

    private async Task UpsertLangue(string code, string nom)
    {
        if (!await db.Langues.AnyAsync(l => l.LngCode == code)) db.Langues.Add(new Langue { LngCode = code, LngNom = nom });
    }
    private async Task UpsertSociete(string nom)
    {
        if (!await db.SocietesGradation.AnyAsync(s => s.SgrNom == nom)) db.SocietesGradation.Add(new SocieteGradation { SgrNom = nom, SgrCode = nom });
    }
    private async Task UpsertTypeItem(string code, string nom)
    {
        if (!await db.TypesItem.AnyAsync(t => t.TypCode == code)) db.TypesItem.Add(new TypeItem { TypCode = code, TypNom = nom });
    }
    private async Task UpsertStatut(string code, string nom, int ordre)
    {
        if (!await db.StatutsCommande.AnyAsync(s => s.StcCode == code)) db.StatutsCommande.Add(new StatutCommande { StcCode = code, StcNom = nom, StcOrdre = ordre });
    }

    // Bloc déduit du préfixe du code de série (EV* -> Écarlate et Violet, EB* -> Épée
    // et Bouclier, BS -> Base) — le DBML fourni exige un Bloc, non présent dans les
    // données sources d'origine (seedSets.json), donc reconstitué de façon raisonnable.
    private async Task<Dictionary<string, int>> SeedBlocsAsync()
    {
        var jeu = await db.Jeux.FirstOrDefaultAsync(j => j.JeuNom == "Pokémon");
        if (jeu is null) { jeu = new Jeu { JeuNom = "Pokémon" }; db.Jeux.Add(jeu); await db.SaveChangesAsync(); }

        var blocs = new Dictionary<string, string> { ["EV"] = "Écarlate et Violet", ["EB"] = "Épée et Bouclier", ["BS"] = "Base" };
        var result = new Dictionary<string, int>();
        foreach (var (prefixe, nom) in blocs)
        {
            var bloc = await db.Blocs.FirstOrDefaultAsync(b => b.BlcNom == nom && b.IdJeu == jeu.IdJeu);
            if (bloc is null) { bloc = new Bloc { BlcNom = nom, IdJeu = jeu.IdJeu }; db.Blocs.Add(bloc); await db.SaveChangesAsync(); }
            result[prefixe] = bloc.IdBloc;
        }
        return result;
    }

    private static string BlocPrefixe(string code) => code.StartsWith("EV") ? "EV" : code.StartsWith("EB") ? "EB" : "BS";

    private async Task SeedCartesAsync(Dictionary<string, int> blocsParPrefixe)
    {
        var json = await File.ReadAllTextAsync(Path.Combine(env.ContentRootPath, "Seed", "seedSets.json"));
        var sets = JsonSerializer.Deserialize<List<SeedSet>>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? [];
        var http = httpFactory.CreateClient();
        http.DefaultRequestHeaders.Add("User-Agent", "TCGWorld-Seed/1.0");

        foreach (var set in sets)
        {
            var idBloc = blocsParPrefixe[BlocPrefixe(set.Code)];
            var serie = await db.Series.FirstOrDefaultAsync(s => s.SerCode == set.Code);
            if (serie is null) { serie = new Serie { SerCode = set.Code, SerNom = set.Name, IdBloc = idBloc }; db.Series.Add(serie); await db.SaveChangesAsync(); }

            List<JsonElement>? cartesJson = null;
            try
            {
                var resp = await http.GetStringAsync($"https://api.tcgdex.net/v2/fr/sets/{set.TcgdexId}");
                using var doc = JsonDocument.Parse(resp);
                // .Clone() : les JsonElement d'un JsonDocument ne sont valides que tant que
                // celui-ci est vivant — la liste doit survivre à la sortie du bloc `using`.
                if (doc.RootElement.TryGetProperty("cards", out var cardsEl))
                    cartesJson = [.. cardsEl.EnumerateArray().Select(e => e.Clone())];
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Impossible de récupérer le set TCGdex {Set} — série créée sans cartes (à relancer plus tard)", set.TcgdexId);
                continue;
            }
            if (cartesJson is null) continue;

            foreach (var c in cartesJson)
            {
                var localId = c.TryGetProperty("localId", out var lid) ? lid.GetString() ?? "" : "";
                var nom = c.TryGetProperty("name", out var n) ? n.GetString() ?? "" : "";
                if (nom == "") continue;
                var image = c.TryGetProperty("image", out var img) ? img.GetString() : null;
                var imageUrl = image is null ? null : $"{image}/high.webp";
                var rarete = c.TryGetProperty("rarity", out var r) ? r.GetString() : null;

                var existe = await db.Cartes.AnyAsync(x => x.IdSerie == serie.IdSerie && x.CrtNumero == localId && x.CrtNom == nom);
                if (existe) continue;
                db.Cartes.Add(new Carte
                {
                    IdSerie = serie.IdSerie,
                    CrtNom = nom,
                    CrtNumero = localId,
                    CrtCode = $"{set.TcgdexId}-{localId}",
                    CrtNumeroSerie = localId,
                    CrtRarete = rarete,
                    CrtImage = imageUrl,
                });
            }
            await db.SaveChangesAsync();
            logger.LogInformation("Série {Code} seedée ({Count} cartes trouvées côté TCGdex)", set.Code, cartesJson.Count);
        }
    }

    private async Task SeedProduitsScellesAsync()
    {
        var json = await File.ReadAllTextAsync(Path.Combine(env.ContentRootPath, "Seed", "sealedProducts.json"));
        var produits = JsonSerializer.Deserialize<List<SealedProduct>>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? [];

        foreach (var p in produits)
        {
            var serie = await db.Series.FirstOrDefaultAsync(s => s.SerCode == p.SeriesCode);
            if (serie is null) { logger.LogWarning("Série {Code} introuvable pour le produit scellé {Slug}", p.SeriesCode, p.Slug); continue; }
            var type = await db.TypesItem.FirstOrDefaultAsync(t => t.TypCode == p.CategorySlug);
            if (type is null) { logger.LogWarning("Type d'item {Type} introuvable pour {Slug}", p.CategorySlug, p.Slug); continue; }

            if (await db.Items.AnyAsync(i => i.IdSerie == serie.IdSerie && i.ItmNom == p.Name)) continue;

            var cheminLocal = await CheminImageLocaleAsync(p);
            db.Items.Add(new Item { IdSerie = serie.IdSerie, IdTypeItem = type.IdTypeItem, ItmNom = p.Name, ItmImage = cheminLocal });
        }
        await db.SaveChangesAsync();
    }

    // Réutilise l'image déjà présente dans wwwroot/uploads/products (copiée depuis
    // server-legacy-node lors de la première passe) plutôt que de la re-télécharger.
    private async Task<string?> CheminImageLocaleAsync(SealedProduct p)
    {
        var dir = Path.Combine(env.WebRootPath, "uploads", "products");
        Directory.CreateDirectory(dir);
        var existant = Directory.Exists(dir) ? Directory.GetFiles(dir, $"{p.Slug}.*").FirstOrDefault() : null;
        if (existant is not null) return $"/uploads/products/{Path.GetFileName(existant)}";

        try
        {
            var http = httpFactory.CreateClient();
            http.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
            var apiPath = p.WikiDomain.Contains("bulbagarden") ? "/w/api.php" : "/api.php";
            var apiUrl = $"https://{p.WikiDomain}{apiPath}?action=query&titles=File:{Uri.EscapeDataString(p.WikiFile)}|Fichier:{Uri.EscapeDataString(p.WikiFile)}&prop=imageinfo&iiprop=url&format=json";
            var json = await http.GetStringAsync(apiUrl);
            using var doc = JsonDocument.Parse(json);
            var pages = doc.RootElement.GetProperty("query").GetProperty("pages");
            var page = pages.EnumerateObject().First();
            if (!page.Value.TryGetProperty("imageinfo", out var infos)) return null;
            var url = infos[0].GetProperty("url").GetString()!;
            var ext = Path.GetExtension(url).Split('?')[0];
            var fichier = Path.Combine(dir, $"{p.Slug}{ext}");
            var bytes = await http.GetByteArrayAsync(url);
            await File.WriteAllBytesAsync(fichier, bytes);
            return $"/uploads/products/{p.Slug}{ext}";
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Téléchargement du visuel impossible pour {Slug}", p.Slug);
            return null;
        }
    }
}
