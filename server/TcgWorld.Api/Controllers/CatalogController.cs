using Microsoft.AspNetCore.Mvc;
using TcgWorld.Api.Services;

namespace TcgWorld.Api.Controllers;

[ApiController]
[Route("api/catalog")]
public class CatalogController(CatalogService catalog) : ControllerBase
{
    [HttpGet("home")]
    public Task<Dtos.HomeDto> Home() => catalog.HomeAsync();

    [HttpGet("search")]
    public Task<Dtos.SearchResultDto> Search(
        [FromQuery] string type = "carte", [FromQuery] string? q = null,
        [FromQuery] int? idSerie = null, [FromQuery] int? idBloc = null, [FromQuery] int? idTypeItem = null,
        [FromQuery] decimal? minPrice = null, [FromQuery] decimal? maxPrice = null,
        [FromQuery] bool availableOnly = false, [FromQuery] int page = 1, [FromQuery] int pageSize = 30) =>
        catalog.SearchAsync(type, q, idSerie, idBloc, idTypeItem, minPrice, maxPrice, availableOnly, page, pageSize);

    [HttpGet("cartes/{id:int}")]
    public Task<Dtos.CarteDetailDto> Carte(int id) => catalog.CarteDetailAsync(id);

    [HttpGet("cartes/serie/{serieCode}/{slug}")]
    public Task<Dtos.CarteDetailDto> CarteBySlug(string serieCode, string slug) => catalog.CarteDetailBySlugAsync(serieCode, slug);

    [HttpGet("items/{id:int}")]
    public Task<Dtos.ItemDetailDto> Item(int id) => catalog.ItemDetailAsync(id);

    [HttpGet("items/serie/{serieCode}/{slug}")]
    public Task<Dtos.ItemDetailDto> ItemBySlug(string serieCode, string slug) => catalog.ItemDetailBySlugAsync(serieCode, slug);

    [HttpGet("series")]
    public Task<List<Dtos.SerieDto>> Series() => catalog.SeriesAsync();

    [HttpGet("blocs")]
    public Task<List<Dtos.BlocDto>> Blocs() => catalog.BlocsAsync();

    [HttpGet("types-item")]
    public Task<List<Dtos.TypeItemDto>> TypesItem() => catalog.TypesItemAsync();

    [HttpGet("langues")]
    public Task<List<Dtos.LangueDto>> Langues() => catalog.LanguesAsync();

    [HttpGet("societes-gradation")]
    public Task<List<Dtos.SocieteGradationDto>> SocietesGradation() => catalog.SocietesGradationAsync();

    [HttpGet("raretes")]
    public Task<List<string>> Raretes() => catalog.RaretesAsync();
}
