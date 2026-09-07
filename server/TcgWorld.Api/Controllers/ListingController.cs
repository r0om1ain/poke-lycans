using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TcgWorld.Api.Dtos;
using TcgWorld.Api.Services;

namespace TcgWorld.Api.Controllers;

[ApiController]
[Route("api/listings")]
public class ListingController(ListingService listings) : ControllerBase
{
    [HttpGet("product")]
    public Task<List<AnnonceDto>> ForProduct(
        [FromQuery] int? idCarte, [FromQuery] int? idItem, [FromQuery] string? etatMin,
        [FromQuery] int? idLangue, [FromQuery] bool? holo, [FromQuery] bool? edition1, [FromQuery] bool? graded) =>
        listings.ForProduitAsync(idCarte, idItem, etatMin, idLangue, holo, edition1, graded);

    [Authorize]
    [HttpGet("mine")]
    public Task<List<AnnonceDto>> Mine([FromQuery] int? idTypeItem, [FromQuery] int? idSerie) =>
        listings.MineAsync(User.PersonId(), idTypeItem, idSerie);

    [Authorize]
    [HttpGet("mine/facets")]
    public Task<List<FacetCategorieDto>> MyFacets() => listings.FacetsForSellerAsync(User.PersonId());

    [Authorize]
    [HttpPost]
    public Task<AnnonceDto> Create([FromForm] CreateAnnonceRequest req, [FromForm] List<IFormFile>? photos) =>
        listings.CreateAsync(User.PersonId(), req, photos);

    [Authorize]
    [HttpPatch("{id:int}")]
    public Task<AnnonceDto> Update(int id, UpdateAnnonceRequest req) => listings.UpdateAsync(id, User.PersonId(), req);

    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Remove(int id)
    {
        await listings.RemoveAsync(id, User.PersonId());
        return NoContent();
    }
}
