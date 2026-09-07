using Microsoft.EntityFrameworkCore;
using TcgWorld.Api.Data;
using TcgWorld.Api.Data.Entities;
using TcgWorld.Api.Dtos;

namespace TcgWorld.Api.Services;

// Estimation de valeur par "relâchement progressif des critères" (miroir de
// server/src/services/pricingService.js) : on cherche des annonces ACTIVE pour la
// même carte en relâchant les critères du plus spécifique au plus général jusqu'à
// trouver au moins un résultat. IdCarte n'est jamais relâché.
public class PricingService(AppDbContext db)
{
    // Du moins prioritaire (relâché en premier) au plus prioritaire (relâché en dernier) —
    // même ordre que RELAX_ORDER côté Node : gradingNote, gradingCompanyId, graded,
    // miscutMisprint, stamp, pokeball, firstEdition, reverse, holo, languageId, state.
    private static readonly string[] RelaxOrder =
        ["NoteGradation", "IdSocieteGradation", "Grade", "Misscut", "Missprint", "Stamp", "Pokeball", "Edition1", "Reverse", "Holo", "IdLangue", "Etat"];

    public async Task<EstimationDto?> EstimateAsync(int idCarte, CaracteristiquesCarte criteres)
    {
        var annonces = await db.Annonces
            .Where(a => a.IdCarte == idCarte && a.AnnStatut == AnnonceStatut.ACTIVE)
            .Include(a => a.AnnonceCarte)
            .ToListAsync();
        if (annonces.Count == 0) return null;

        var predicates = new Dictionary<string, Func<Annonce, bool>>();
        if (criteres.NoteGradation is not null) predicates["NoteGradation"] = a => a.AnnonceCarte?.AncNoteGradation == criteres.NoteGradation;
        if (criteres.IdSocieteGradation is not null) predicates["IdSocieteGradation"] = a => a.AnnonceCarte?.IdSocieteGradation == criteres.IdSocieteGradation;
        if (criteres.Grade is not null) predicates["Grade"] = a => a.AnnonceCarte?.AncFlgGrade == criteres.Grade;
        if (criteres.Misscut is not null) predicates["Misscut"] = a => a.AnnonceCarte?.AncFlgMisscut == criteres.Misscut;
        if (criteres.Missprint is not null) predicates["Missprint"] = a => a.AnnonceCarte?.AncFlgMissprint == criteres.Missprint;
        if (criteres.Stamp is not null) predicates["Stamp"] = a => a.AnnonceCarte?.AncFlgStamp == criteres.Stamp;
        if (criteres.Pokeball is not null) predicates["Pokeball"] = a => a.AnnonceCarte?.AncFlgPokeball == criteres.Pokeball;
        if (criteres.Edition1 is not null) predicates["Edition1"] = a => a.AnnonceCarte?.AncFlgEdition1 == criteres.Edition1;
        if (criteres.Reverse is not null) predicates["Reverse"] = a => a.AnnonceCarte?.AncFlgReverse == criteres.Reverse;
        if (criteres.Holo is not null) predicates["Holo"] = a => a.AnnonceCarte?.AncFlgHolo == criteres.Holo;
        if (criteres.IdLangue is not null) predicates["IdLangue"] = a => a.IdLangue == criteres.IdLangue;
        if (criteres.Etat is not null) predicates["Etat"] = a => a.AnnonceCarte?.AncEtat == criteres.Etat;

        var totalCriteres = predicates.Count;
        var actifs = new HashSet<string>(predicates.Keys);

        while (true)
        {
            var candidats = annonces.Where(a => actifs.All(k => predicates[k](a))).ToList();
            if (candidats.Count > 0)
            {
                var prix = candidats.Select(a => a.AnnPrix).ToList();
                var estime = Math.Round(prix.Average(), 2);
                return new EstimationDto(estime, prix.Min(), prix.Max(), prix.Count, actifs.Count == totalCriteres);
            }
            var aRetirer = RelaxOrder.FirstOrDefault(actifs.Contains);
            if (aRetirer is null) break;
            actifs.Remove(aRetirer);
        }
        return null;
    }
}
