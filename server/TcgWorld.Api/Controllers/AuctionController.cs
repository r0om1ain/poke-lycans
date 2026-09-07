using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TcgWorld.Api.Dtos;
using TcgWorld.Api.Services;

namespace TcgWorld.Api.Controllers;

[ApiController]
[Route("api/auctions")]
public class AuctionController(AuctionService auctions) : ControllerBase
{
    [HttpGet]
    public Task<List<EnchereResumeDto>> List([FromQuery] int? idSerie, [FromQuery] int page = 1, [FromQuery] int pageSize = 24) =>
        auctions.ListAsync(idSerie, page, pageSize);

    [Authorize]
    [HttpGet("mine/all")]
    public Task<List<EnchereResumeDto>> Mine() => auctions.MineAsync(User.PersonId());

    [HttpGet("{id:int}")]
    public Task<EnchereDetailDto> Detail(int id) => auctions.DetailAsync(id);

    [Authorize]
    [HttpPost]
    public Task<EnchereDetailDto> Create([FromForm] CreateEnchereRequest req, [FromForm] List<IFormFile>? photos) =>
        auctions.CreateAsync(User.PersonId(), req, photos);

    [Authorize]
    [HttpPost("{id:int}/bids")]
    public Task<EnchereDetailDto> PlaceBid(int id, PlaceBidRequest req) => auctions.PlaceBidAsync(id, User.PersonId(), req.Montant);

    [Authorize]
    [HttpPost("{id:int}/finalize")]
    public Task<object> Finalize(int id, FinalizeAuctionRequest req) => auctions.FinalizeAsync(id, User.PersonId(), req);
}
