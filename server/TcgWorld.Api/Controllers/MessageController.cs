using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TcgWorld.Api.Dtos;
using TcgWorld.Api.Services;

namespace TcgWorld.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/messages")]
public class MessageController(MessagingService messaging) : ControllerBase
{
    [HttpGet("conversations")]
    public Task<List<ConversationDto>> Conversations() => messaging.ConversationsAsync(User.PersonId());

    [HttpPost("contact")]
    public Task<ConversationDto> Contact(ContactRequest req) => messaging.ContactAsync(User.PersonId(), req);

    [HttpGet("conversations/{id:int}/messages")]
    public Task<List<MessageDto>> Messages(int id) => messaging.MessagesAsync(id, User.PersonId());

    [HttpPost("conversations/{id:int}/messages")]
    public Task<MessageDto> SendText(int id, SendTextRequest req) => messaging.SendTextAsync(id, User.PersonId(), req.Contenu);

    [HttpPost("conversations/{id:int}/images")]
    public Task<MessageDto> SendImage(int id, IFormFile image) => messaging.SendImageAsync(id, User.PersonId(), image);

    [HttpPost("conversations/{id:int}/offers")]
    public Task<MessageDto> MakeOffer(int id, MakeOfferRequest req) => messaging.MakeOfferAsync(id, User.PersonId(), req.Montant);

    [HttpPost("offers/{idOffre:int}/respond")]
    public Task<OffrePrixDto> RespondOffer(int idOffre, RespondOfferRequest req) => messaging.RespondOfferAsync(idOffre, User.PersonId(), req.Accept);
}
