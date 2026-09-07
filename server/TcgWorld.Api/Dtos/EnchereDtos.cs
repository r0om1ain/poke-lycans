using TcgWorld.Api.Data.Entities;

namespace TcgWorld.Api.Dtos;

public record MiseDto(int Id, VendeurResumeDto Personne, decimal Montant, DateTime Date)
{
    public static MiseDto From(MiseEnchere m) => new(m.IdMiseEnchere, VendeurResumeDto.From(m.Personne), m.MisMontant, m.MisDate);
}

// Résumé pour listes (accueil, liste d'enchères) — prix courant déduit de la
// meilleure mise (ou prix de départ si aucune), il n'y a pas de colonne dédiée.
public record EnchereResumeDto(
    int Id, ProduitResumeDto Produit, decimal PrixCourant, DateTime DateFin, string Statut, int NombreMises)
{
    public static EnchereResumeDto From(Enchere e)
    {
        var produit = e.Carte is not null ? ProduitResumeDto.FromCarte(e.Carte) : ProduitResumeDto.FromItem(e.Item!);
        var prixCourant = e.Mises.Count > 0 ? e.Mises.Max(m => m.MisMontant) : e.EncPrixDepart;
        return new(e.IdEnchere, produit, prixCourant, e.EncDateFin, e.EncStatut.ToString(), e.Mises.Count);
    }
}

public record EnchereDetailDto(
    int Id, VendeurResumeDto Vendeur, ProduitResumeDto Produit, string? Description,
    decimal PrixDepart, decimal? PrixReserve, decimal PrixCourant, decimal? PrixFinal,
    DateTime DateDebut, DateTime DateFin, string Statut, CaracteristiquesDto? Caracteristiques,
    List<string> Photos, List<MiseDto> Mises, int? IdPersonneGagnant)
{
    public static EnchereDetailDto From(Enchere e)
    {
        var produit = e.Carte is not null ? ProduitResumeDto.FromCarte(e.Carte) : ProduitResumeDto.FromItem(e.Item!);
        var prixCourant = e.Mises.Count > 0 ? e.Mises.Max(m => m.MisMontant) : e.EncPrixDepart;
        CaracteristiquesDto? carac = e.EnchereCarte is null ? null : new(
            e.EnchereCarte.EncEtat?.ToString(), e.IdLangue, e.EnchereCarte.EncFlgHolo, e.EnchereCarte.EncFlgEdition1,
            e.EnchereCarte.EncFlgPokeball, e.EnchereCarte.EncFlgMisscut, e.EnchereCarte.EncFlgMissprint,
            e.EnchereCarte.EncFlgStamp, e.EnchereCarte.EncFlgReverse, e.EnchereCarte.EncFlgGrade,
            e.EnchereCarte.IdSocieteGradation, e.EnchereCarte.EncNoteGradation);
        return new(e.IdEnchere, VendeurResumeDto.From(e.Personne), produit, e.EncDescription,
            e.EncPrixDepart, e.EncPrixReserve, prixCourant, e.EncPrixFinal, e.EncDateDebut, e.EncDateFin,
            e.EncStatut.ToString(), carac, [.. e.Photos.OrderBy(p => p.PheOrdre).Select(p => p.PheChemin)],
            [.. e.Mises.OrderByDescending(m => m.MisMontant).Select(MiseDto.From)], e.IdPersonneGagnant);
    }
}

public record CreateEnchereRequest(
    int? IdCarte, int? IdItem, int? IdLangue, string? Description, decimal PrixDepart, decimal? PrixReserve, int DureeJours,
    string? Etat, bool? Holo, bool? Edition1, bool? Pokeball, bool? Misscut, bool? Missprint,
    bool? Stamp, bool? Reverse, bool? Grade, int? IdSocieteGradation, decimal? NoteGradation);

public record PlaceBidRequest(decimal Montant);

public record FinalizeAuctionRequest(string Adresse, string CodePostal, string Ville, string Pays);
