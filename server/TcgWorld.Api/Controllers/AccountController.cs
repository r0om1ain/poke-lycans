using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TcgWorld.Api.Data;
using TcgWorld.Api.Dtos;
using TcgWorld.Api.Services;

namespace TcgWorld.Api.Controllers;

// Pas de carnet d'adresses ni de moyens de paiement séparés : le nouveau schéma
// (datPersonne) ne porte qu'une seule adresse inline par personne, et aucune table
// de moyen de paiement (paiement mock sans table dédiée — décision utilisateur).
[Authorize]
[ApiController]
[Route("api/account")]
public class AccountController(AppDbContext db, VueRecenteService vuesRecentes) : ControllerBase
{
    [HttpPatch("profile")]
    public async Task<ActionResult<PersonneDto>> UpdateProfile(UpdateProfileRequest req)
    {
        var personne = await db.Personnes.FindAsync(User.PersonId()) ?? throw ApiException.Unauthorized();
        if (req.Nom is not null) personne.PrsNom = req.Nom;
        if (req.Prenom is not null) personne.PrsPrenom = req.Prenom;
        if (req.Telephone is not null) personne.PrsTelephone = req.Telephone;
        if (req.Adresse is not null) personne.PrsAdresse = req.Adresse;
        if (req.CodePostal is not null) personne.PrsCodePostal = req.CodePostal;
        if (req.Ville is not null) personne.PrsVille = req.Ville;
        if (req.Pays is not null) personne.PrsPays = req.Pays;
        await db.SaveChangesAsync();
        return PersonneDto.From(personne);
    }

    [HttpGet("vues-recentes")]
    public async Task<ActionResult<List<ProduitResumeDto>>> VuesRecentes([FromQuery] int limit = 12) =>
        await vuesRecentes.ListerAsync(User.PersonId(), limit);

    public record EnregistrerVueRequest(int? IdCarte, int? IdItem);

    [HttpPost("vues-recentes")]
    public async Task<IActionResult> EnregistrerVue(EnregistrerVueRequest req)
    {
        await vuesRecentes.EnregistrerAsync(User.PersonId(), req.IdCarte, req.IdItem);
        return NoContent();
    }
}
