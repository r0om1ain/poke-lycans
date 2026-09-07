using System.Globalization;
using System.Text;
using TcgWorld.Api.Data.Entities;

namespace TcgWorld.Api.Services;

// Slug lisible pour les URLs produit ("/produits/:serieCode/:slug") — pas de colonne
// stockée, calculé à la volée. Existe en deux variantes (Carte / Item) puisque le
// nouveau schéma n'a plus de Product unifié.
public static class SlugHelper
{
    public static string Slugify(string str)
    {
        var normalized = str.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder();
        foreach (var ch in normalized)
        {
            var category = CharUnicodeInfo.GetUnicodeCategory(ch);
            if (category != UnicodeCategory.NonSpacingMark) sb.Append(ch);
        }
        var ascii = sb.ToString().ToLowerInvariant();
        ascii = System.Text.RegularExpressions.Regex.Replace(ascii, "[^a-z0-9]+", "-");
        return ascii.Trim('-');
    }

    public static string CarteSlug(Carte carte)
    {
        var baseSlug = Slugify(carte.CrtNom);
        return string.IsNullOrEmpty(carte.CrtNumero) ? baseSlug : $"{baseSlug}-{Slugify(carte.CrtNumero)}";
    }

    public static string ItemSlug(Item item)
    {
        var baseSlug = Slugify(item.ItmNom);
        return string.IsNullOrEmpty(item.ItmNumero) ? baseSlug : $"{baseSlug}-{Slugify(item.ItmNumero)}";
    }
}
