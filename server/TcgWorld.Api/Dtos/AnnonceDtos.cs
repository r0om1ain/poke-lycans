using TcgWorld.Api.Data.Entities;

namespace TcgWorld.Api.Dtos;

public record VendeurResumeDto(int Id, string Pseudo)
{
    public static VendeurResumeDto From(Personne p) => new(p.IdPersonne, p.PrsPseudo);
}

public record CaracteristiquesDto(
    string? Etat, int? IdLangue, bool Holo, bool Edition1, bool Pokeball, bool Misscut, bool Missprint,
    bool Stamp, bool Reverse, bool Grade, int? IdSocieteGradation, decimal? NoteGradation);

public record AnnonceDto(
    int Id, VendeurResumeDto Vendeur, ProduitResumeDto Produit, decimal Prix, int Quantite,
    string? Description, string Statut, CaracteristiquesDto? Caracteristiques, List<string> Photos, DateTime DateCreation)
{
    public static AnnonceDto From(Annonce a)
    {
        var produit = a.Carte is not null ? ProduitResumeDto.FromCarte(a.Carte)
            : a.Item is not null ? ProduitResumeDto.FromItem(a.Item)
            : throw new InvalidOperationException("Annonce sans carte ni item");
        CaracteristiquesDto? carac = a.AnnonceCarte is null ? null : new(
            a.AnnonceCarte.AncEtat?.ToString(), a.IdLangue, a.AnnonceCarte.AncFlgHolo, a.AnnonceCarte.AncFlgEdition1,
            a.AnnonceCarte.AncFlgPokeball, a.AnnonceCarte.AncFlgMisscut, a.AnnonceCarte.AncFlgMissprint,
            a.AnnonceCarte.AncFlgStamp, a.AnnonceCarte.AncFlgReverse, a.AnnonceCarte.AncFlgGrade,
            a.AnnonceCarte.IdSocieteGradation, a.AnnonceCarte.AncNoteGradation);
        return new(a.IdAnnonce, VendeurResumeDto.From(a.Personne), produit, a.AnnPrix, a.AnnQuantite,
            a.AnnDescription, a.AnnStatut.ToString(), carac, [.. a.Photos.OrderBy(p => p.PhoOrdre).Select(p => p.PhoChemin)], a.AnnDateCreation);
    }
}

public record CreateAnnonceRequest(
    int? IdCarte, int? IdItem, int? IdLangue, decimal Prix, int Quantite, string? Description,
    string? Etat, bool? Holo, bool? Edition1, bool? Pokeball, bool? Misscut, bool? Missprint,
    bool? Stamp, bool? Reverse, bool? Grade, int? IdSocieteGradation, decimal? NoteGradation);

public record UpdateAnnonceRequest(decimal? Prix, int? Quantite, string? Description, string? Statut);

public record FacetCategorieDto(int? IdTypeItem, string Nom, int Total);
