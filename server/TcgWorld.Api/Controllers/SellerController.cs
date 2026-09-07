using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TcgWorld.Api.Data;
using TcgWorld.Api.Dtos;
using TcgWorld.Api.Services;

namespace TcgWorld.Api.Controllers;

// Pas d'endpoint "modes de livraison" (ShippingMethod supprimé, décision utilisateur).
[ApiController]
[Route("api/sellers")]
public class SellerController(AppDbContext db, ListingService listings) : ControllerBase
{
    [HttpGet("{id:int}")]
    public async Task<SellerProfileDto> Profile(int id)
    {
        var personne = await db.Personnes.FindAsync(id) ?? throw ApiException.NotFound("Vendeur introuvable");
        var evaluations = await db.Evaluations.Where(e => e.IdPersonneEvaluee == id).ToListAsync();
        var moyenne = evaluations.Count > 0 ? Math.Round((decimal)evaluations.Average(e => e.EvaNote), 1) : 0;
        return new SellerProfileDto(personne.IdPersonne, personne.PrsPseudo, personne.PrsDateCreation, moyenne, evaluations.Count);
    }

    [HttpGet("{id:int}/listings")]
    public Task<List<AnnonceDto>> Listings(int id, [FromQuery] int? idTypeItem) => listings.ForSellerPublicAsync(id, idTypeItem);

    [HttpGet("{id:int}/reviews")]
    public async Task<List<EvaluationDto>> Reviews(int id) =>
        [.. (await db.Evaluations.Where(e => e.IdPersonneEvaluee == id).Include(e => e.PersonneAuteur)
            .OrderByDescending(e => e.EvaDateCreation).ToListAsync())
            .Select(e => new EvaluationDto(e.IdEvaluation, e.PersonneAuteur.PrsPseudo, e.EvaNote, e.EvaCommentaire, e.EvaDateCreation))];
}
