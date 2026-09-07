using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TcgWorld.Api.Dtos;
using TcgWorld.Api.Services;

namespace TcgWorld.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/cart")]
public class CartController(CartService cart) : ControllerBase
{
    [HttpGet]
    public Task<PanierDto> Get() => cart.GetAsync(User.PersonId());

    [HttpPost("items")]
    public Task<PanierDto> Add(AddPanierRequest req) => cart.AddAsync(User.PersonId(), req);

    [HttpPatch("items/{id:int}")]
    public Task<PanierDto> UpdateQuantity(int id, UpdatePanierRequest req) => cart.UpdateQuantityAsync(id, User.PersonId(), req);

    [HttpDelete("items/{id:int}")]
    public Task<PanierDto> Remove(int id) => cart.RemoveAsync(id, User.PersonId());
}
