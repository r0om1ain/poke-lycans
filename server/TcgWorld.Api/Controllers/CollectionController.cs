using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TcgWorld.Api.Dtos;
using TcgWorld.Api.Services;

namespace TcgWorld.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/collection")]
public class CollectionController(CollectionService collection, SeriesProgressService progress) : ControllerBase
{
    [HttpGet]
    public async Task<object> List([FromQuery] int? idSerie)
    {
        var (cartes, items) = await collection.ListAsync(User.PersonId(), idSerie);
        return new { cartes, items };
    }

    [HttpPost("cartes")]
    public Task<CollectionCarteDto> AddCarte(AddCollectionCarteRequest req) => collection.AddCarteAsync(User.PersonId(), req);

    [HttpPost("items")]
    public Task<CollectionItemDto> AddItem(AddCollectionItemRequest req) => collection.AddItemAsync(User.PersonId(), req);

    [HttpGet("progress")]
    public Task<List<ProgressionSerieDto>> Progress() => progress.GetProgressAsync(User.PersonId());

    [HttpGet("value")]
    public Task<ValeurTotaleDto> Value() => collection.TotalValueAsync(User.PersonId());

    [HttpPatch("cartes/{id:int}")]
    public Task<CollectionCarteDto> UpdateCarte(int id, UpdateCollectionCarteRequest req) => collection.UpdateCarteAsync(id, User.PersonId(), req);

    [HttpDelete("cartes/{id:int}")]
    public async Task<IActionResult> RemoveCarte(int id)
    {
        await collection.RemoveCarteAsync(id, User.PersonId());
        return NoContent();
    }

    [HttpGet("cartes/{id:int}/estimate")]
    public Task<EstimationDto?> Estimate(int id) => collection.EstimateAsync(id, User.PersonId());

    [HttpPost("cartes/{id:int}/sell")]
    public Task<AnnonceDto> Sell(int id, SellFromCollectionRequest req) => collection.SellAsync(id, User.PersonId(), req);
}
