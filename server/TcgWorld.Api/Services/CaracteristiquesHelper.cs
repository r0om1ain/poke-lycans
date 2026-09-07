using TcgWorld.Api.Data.Entities;

namespace TcgWorld.Api.Services;

// Caractéristiques d'exemplaire — dupliquées sur 3 tables parallèles dans le nouveau
// schéma (AnnonceCarte, EnchereCarte, CollectionCarte) plutôt que des colonnes
// optionnelles sur une table unique. Ce DTO neutre + ces mappers factorisent la
// logique commune (règle "pas de note sans FlgGrade", seuil de recherche par état).
public record CaracteristiquesCarte(
    EtatCarte? Etat, int? IdLangue, bool? Holo, bool? Edition1, bool? Pokeball,
    bool? Misscut, bool? Missprint, bool? Stamp, bool? Reverse, bool? Grade,
    int? IdSocieteGradation, decimal? NoteGradation);

public static class CaracteristiquesHelper
{
    // Ordre du meilleur au pire (miroir de server/src/lib/characteristics.js VALID_STATES).
    public static readonly EtatCarte[] EtatsOrdre =
        [EtatCarte.MINT, EtatCarte.NM, EtatCarte.EXCELLENT, EtatCarte.GOOD, EtatCarte.LP, EtatCarte.PLAYED, EtatCarte.POOR];

    // "Au moins aussi bon que" — utilisé pour le filtre de recherche en seuil.
    public static EtatCarte[] AuMoinsAussiBonQue(EtatCarte minEtat)
    {
        var idx = Array.IndexOf(EtatsOrdre, minEtat);
        return EtatsOrdre[..(idx + 1)];
    }

    // Applique la règle "pas de note/société de gradation sans Grade=true".
    public static void AppliquerRegleGradation(bool grade, ref int? idSocieteGradation, ref decimal? note)
    {
        if (!grade)
        {
            idSocieteGradation = null;
            note = null;
        }
    }

    public static void AppliquerAnnonceCarte(AnnonceCarte c, CaracteristiquesCarte v)
    {
        c.AncEtat = v.Etat;
        c.AncFlgHolo = v.Holo ?? false;
        c.AncFlgEdition1 = v.Edition1 ?? false;
        c.AncFlgPokeball = v.Pokeball ?? false;
        c.AncFlgMisscut = v.Misscut ?? false;
        c.AncFlgMissprint = v.Missprint ?? false;
        c.AncFlgStamp = v.Stamp ?? false;
        c.AncFlgReverse = v.Reverse ?? false;
        c.AncFlgGrade = v.Grade ?? false;
        var idSg = v.IdSocieteGradation; var note = v.NoteGradation;
        AppliquerRegleGradation(c.AncFlgGrade, ref idSg, ref note);
        c.IdSocieteGradation = idSg; c.AncNoteGradation = note;
    }

    public static void AppliquerEnchereCarte(EnchereCarte c, CaracteristiquesCarte v)
    {
        c.EncEtat = v.Etat;
        c.EncFlgHolo = v.Holo ?? false;
        c.EncFlgEdition1 = v.Edition1 ?? false;
        c.EncFlgPokeball = v.Pokeball ?? false;
        c.EncFlgMisscut = v.Misscut ?? false;
        c.EncFlgMissprint = v.Missprint ?? false;
        c.EncFlgStamp = v.Stamp ?? false;
        c.EncFlgReverse = v.Reverse ?? false;
        c.EncFlgGrade = v.Grade ?? false;
        var idSg = v.IdSocieteGradation; var note = v.NoteGradation;
        AppliquerRegleGradation(c.EncFlgGrade, ref idSg, ref note);
        c.IdSocieteGradation = idSg; c.EncNoteGradation = note;
    }

    public static void AppliquerCollectionCarte(CollectionCarte c, CaracteristiquesCarte v)
    {
        c.ColcEtat = v.Etat;
        c.ColcFlgHolo = v.Holo ?? false;
        c.ColcFlgEdition1 = v.Edition1 ?? false;
        c.ColcFlgPokeball = v.Pokeball ?? false;
        c.ColcFlgMisscut = v.Misscut ?? false;
        c.ColcFlgMissprint = v.Missprint ?? false;
        c.ColcFlgStamp = v.Stamp ?? false;
        c.ColcFlgReverse = v.Reverse ?? false;
        c.ColcFlgGrade = v.Grade ?? false;
        var idSg = v.IdSocieteGradation; var note = v.NoteGradation;
        AppliquerRegleGradation(c.ColcFlgGrade, ref idSg, ref note);
        c.IdSocieteGradation = idSg; c.ColcNoteGradation = note;
    }
}
