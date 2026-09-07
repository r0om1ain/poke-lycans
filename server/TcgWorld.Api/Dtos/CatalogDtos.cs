using TcgWorld.Api.Data.Entities;
using TcgWorld.Api.Services;

namespace TcgWorld.Api.Dtos;

public record SerieDto(int Id, string Nom, string? Code, string Label)
{
    public static SerieDto From(Serie s) => new(s.IdSerie, s.SerNom, s.SerCode, FormatSerieHelper.Format(s));
}

public record BlocDto(int Id, string Nom, List<SerieDto> Series)
{
    public static BlocDto From(Bloc b) => new(b.IdBloc, b.BlcNom, [.. b.Series.Select(SerieDto.From)]);
}

public record TypeItemDto(int Id, string Nom, string? Code)
{
    public static TypeItemDto From(TypeItem t) => new(t.IdTypeItem, t.TypNom, t.TypCode);
}

public record LangueDto(int Id, string Nom, string Code)
{
    public static LangueDto From(Langue l) => new(l.IdLangue, l.LngNom, l.LngCode);
}

public record SocieteGradationDto(int Id, string Nom, string? Code)
{
    public static SocieteGradationDto From(SocieteGradation s) => new(s.IdSocieteGradation, s.SgrNom, s.SgrCode);
}

// Résumé unifié Carte|Item — remplace l'ancien Product unique. `Type` vaut "carte"
// ou "item", `Id` est l'id de la table correspondante.
public record ProduitResumeDto(
    string Type, int Id, string Nom, string? Image, string? Numero, string? Rarete,
    SerieDto Serie, string Slug, decimal? PrixMin)
{
    public static ProduitResumeDto FromCarte(Carte c, decimal? prixMin = null) => new(
        "carte", c.IdCarte, c.CrtNom, c.CrtImage, c.CrtNumero, c.CrtRarete,
        SerieDto.From(c.Serie), SlugHelper.CarteSlug(c), prixMin);

    public static ProduitResumeDto FromItem(Item i, decimal? prixMin = null) => new(
        "item", i.IdItem, i.ItmNom, i.ItmImage, i.ItmNumero, null,
        SerieDto.From(i.Serie), SlugHelper.ItemSlug(i), prixMin);
}

public record CarteDetailDto(
    int Id, string Nom, string? Numero, string? Code, string? NumeroSerie, string? Rarete,
    string? Image, SerieDto Serie, string Slug);

public record ItemDetailDto(
    int Id, string Nom, string? Numero, string? Image, SerieDto Serie, TypeItemDto Type, string Slug);

public record HomeDto(
    List<ProduitResumeDto> Tendances, List<SerieDto> Series, List<ProduitResumeDto> BonnesAffaires,
    List<EnchereResumeDto> EncheresBientotTerminees);

public record SearchResultDto(List<ProduitResumeDto> Resultats, int Total, int Page, int PageSize);
