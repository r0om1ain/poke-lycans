using TcgWorld.Api.Data.Entities;

namespace TcgWorld.Api.Dtos;

public record CollectionCarteDto(
    int Id, ProduitResumeDto Produit, int Quantite, CaracteristiquesDto Caracteristiques, DateTime DateAjout)
{
    public static CollectionCarteDto From(CollectionCarte c) => new(
        c.IdCollectionCarte, ProduitResumeDto.FromCarte(c.Carte), c.ColcQuantite,
        new(c.ColcEtat?.ToString(), c.IdLangue, c.ColcFlgHolo, c.ColcFlgEdition1, c.ColcFlgPokeball,
            c.ColcFlgMisscut, c.ColcFlgMissprint, c.ColcFlgStamp, c.ColcFlgReverse, c.ColcFlgGrade,
            c.IdSocieteGradation, c.ColcNoteGradation),
        c.ColcDateAjout);
}

public record CollectionItemDto(int Id, ProduitResumeDto Produit, int Quantite, string? Etat, DateTime DateAjout)
{
    public static CollectionItemDto From(CollectionItem c) => new(
        c.IdCollectionItem, ProduitResumeDto.FromItem(c.Item), c.CliQuantite, c.CliEtat, c.CliDateAjout);
}

public record AddCollectionCarteRequest(
    int IdCarte, int Quantite, int? IdLangue, string? Etat, bool? Holo, bool? Edition1, bool? Pokeball,
    bool? Misscut, bool? Missprint, bool? Stamp, bool? Reverse, bool? Grade, int? IdSocieteGradation, decimal? NoteGradation);

public record AddCollectionItemRequest(int IdItem, int Quantite, int? IdLangue, string? Etat);

public record UpdateCollectionCarteRequest(int? Quantite);

public record EstimationDto(decimal? Estime, decimal? Min, decimal? Max, int TailleEchantillon, bool CorrespondanceExacte);

public record ValeurTotaleDto(decimal Total, int ArticlesEstimes, int ArticlesTotal);

public record ProgressionSerieDto(SerieDto Serie, int Possedees, int Total, decimal Pourcentage);

public record SellFromCollectionRequest(decimal Prix, int Quantite, string? Description);
