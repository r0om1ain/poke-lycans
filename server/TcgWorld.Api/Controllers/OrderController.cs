using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TcgWorld.Api.Dtos;
using TcgWorld.Api.Services;

namespace TcgWorld.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/orders")]
public class OrderController(OrderService orders) : ControllerBase
{
    [HttpPost("checkout")]
    public Task<List<CommandeDto>> Checkout(CheckoutRequest req) => orders.CheckoutAsync(User.PersonId(), req);

    [HttpGet("purchases")]
    public Task<List<CommandeDto>> Purchases([FromQuery] string? status) => orders.PurchasesAsync(User.PersonId(), status);

    [HttpGet("sales")]
    public Task<List<CommandeDto>> Sales([FromQuery] string? status) => orders.SalesAsync(User.PersonId(), status);

    [HttpGet("{id:int}")]
    public Task<CommandeDto> Detail(int id) => orders.DetailAsync(id, User.PersonId());

    [HttpPost("{id:int}/pay")]
    public Task<CommandeDto> Pay(int id) => orders.PayAsync(id, User.PersonId());

    [HttpPost("{id:int}/ship")]
    public Task<CommandeDto> Ship(int id, ExpedierRequest req) => orders.ShipAsync(id, User.PersonId(), req);

    [HttpPost("{id:int}/receive")]
    public Task<CommandeDto> Receive(int id) => orders.ReceiveAsync(id, User.PersonId());

    [HttpPost("{id:int}/review")]
    public async Task<IActionResult> Review(int id, ReviewRequest req)
    {
        await orders.ReviewAsync(id, User.PersonId(), req);
        return NoContent();
    }
}
