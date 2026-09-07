using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using TcgWorld.Api.Data;
using TcgWorld.Api.Data.Entities;
using TcgWorld.Api.Dtos;
using TcgWorld.Api.Hubs;

namespace TcgWorld.Api.Services;

// datConversation/datMessage/datOffrePrix — tables ajoutées en plus du DBML fourni
// (messagerie/négociation conservée, décision utilisateur). Pousse via MessagesHub
// au lieu du polling 5s de la première passe.
public class MessagingService(AppDbContext db, UploadHelper upload, IHubContext<MessagesHub> hub)
{
    public async Task<List<ConversationDto>> ConversationsAsync(int idPersonne)
    {
        var conversations = await db.Conversations
            .Where(c => c.IdPersonneAcheteur == idPersonne || c.IdPersonneVendeur == idPersonne)
            .Include(c => c.PersonneAcheteur).Include(c => c.PersonneVendeur)
            .OrderByDescending(c => c.ConDateCreation).ToListAsync();
        return [.. conversations.Select(ConversationDto.From)];
    }

    public async Task<ConversationDto> ContactAsync(int idPersonne, ContactRequest req)
    {
        int idVendeur;
        int? idAnnonce = req.IdAnnonce, idEnchere = req.IdEnchere, idCommande = req.IdCommande;

        if (req.IdCommande is not null)
        {
            var commande = await db.Commandes.FindAsync(req.IdCommande) ?? throw ApiException.NotFound("Commande introuvable");
            if (commande.IdAcheteur != idPersonne && commande.IdVendeur != idPersonne) throw ApiException.Forbidden();
            idVendeur = commande.IdVendeur;
        }
        else if (req.IdAnnonce is not null)
        {
            var annonce = await db.Annonces.FindAsync(req.IdAnnonce) ?? throw ApiException.NotFound("Annonce introuvable");
            idVendeur = annonce.IdPersonne;
        }
        else if (req.IdEnchere is not null)
        {
            var enchere = await db.Encheres.FindAsync(req.IdEnchere) ?? throw ApiException.NotFound("Enchère introuvable");
            idVendeur = enchere.IdPersonne;
        }
        else if (req.IdPersonneVendeur is not null)
        {
            idVendeur = req.IdPersonneVendeur.Value;
        }
        else throw ApiException.BadRequest("idPersonneVendeur, idAnnonce, idEnchere ou idCommande requis");

        if (idVendeur == idPersonne) throw ApiException.BadRequest("Impossible de se contacter soi-même");

        var conversation = await db.Conversations
            .Include(c => c.PersonneAcheteur).Include(c => c.PersonneVendeur)
            .FirstOrDefaultAsync(c => c.IdPersonneAcheteur == idPersonne && c.IdPersonneVendeur == idVendeur
                && c.IdAnnonce == idAnnonce && c.IdEnchere == idEnchere && c.IdCommande == idCommande);
        if (conversation is null)
        {
            conversation = new Conversation { IdPersonneAcheteur = idPersonne, IdPersonneVendeur = idVendeur, IdAnnonce = idAnnonce, IdEnchere = idEnchere, IdCommande = idCommande };
            db.Conversations.Add(conversation);
            await db.SaveChangesAsync();
            await db.Entry(conversation).Reference(c => c.PersonneAcheteur).LoadAsync();
            await db.Entry(conversation).Reference(c => c.PersonneVendeur).LoadAsync();
        }
        return ConversationDto.From(conversation);
    }

    private async Task<Conversation> GetConversationAsync(int id, int idPersonne)
    {
        var conversation = await db.Conversations.FirstOrDefaultAsync(c => c.IdConversation == id) ?? throw ApiException.NotFound();
        if (conversation.IdPersonneAcheteur != idPersonne && conversation.IdPersonneVendeur != idPersonne) throw ApiException.Forbidden();
        return conversation;
    }

    public async Task<List<MessageDto>> MessagesAsync(int idConversation, int idPersonne)
    {
        await GetConversationAsync(idConversation, idPersonne);
        var messages = await db.Messages.Where(m => m.IdConversation == idConversation)
            .Include(m => m.PersonneExpediteur).Include(m => m.OffrePrix)
            .OrderBy(m => m.MsgDateCreation).ToListAsync();
        return [.. messages.Select(MessageDto.From)];
    }

    private async Task PushAsync(int idConversation, string evenement, object payload) =>
        await hub.Clients.Group(MessagesHub.GroupName(idConversation.ToString())).SendAsync(evenement, payload);

    public async Task<MessageDto> SendTextAsync(int idConversation, int idPersonne, string contenu)
    {
        await GetConversationAsync(idConversation, idPersonne);
        var message = new Message { IdConversation = idConversation, IdPersonneExpediteur = idPersonne, MsgType = TypeMessage.TEXTE, MsgContenu = contenu };
        db.Messages.Add(message);
        await db.SaveChangesAsync();
        var dto = MessageDto.From(await db.Messages.Include(m => m.PersonneExpediteur).FirstAsync(m => m.IdMessage == message.IdMessage));
        await PushAsync(idConversation, "messageReceived", dto);
        return dto;
    }

    public async Task<MessageDto> SendImageAsync(int idConversation, int idPersonne, IFormFile image)
    {
        await GetConversationAsync(idConversation, idPersonne);
        var chemin = await upload.SaveAsync(image, "messages");
        var message = new Message { IdConversation = idConversation, IdPersonneExpediteur = idPersonne, MsgType = TypeMessage.IMAGE, MsgImage = chemin };
        db.Messages.Add(message);
        await db.SaveChangesAsync();
        var dto = MessageDto.From(await db.Messages.Include(m => m.PersonneExpediteur).FirstAsync(m => m.IdMessage == message.IdMessage));
        await PushAsync(idConversation, "messageReceived", dto);
        return dto;
    }

    // Seul l'acheteur de la conversation peut proposer un prix, et uniquement sur
    // une conversation liée à une annonce (miroir de messageController.makeOffer).
    public async Task<MessageDto> MakeOfferAsync(int idConversation, int idPersonne, decimal montant)
    {
        var conversation = await GetConversationAsync(idConversation, idPersonne);
        if (conversation.IdPersonneAcheteur != idPersonne) throw ApiException.Forbidden("Seul l'acheteur peut proposer un prix");
        if (conversation.IdAnnonce is null) throw ApiException.BadRequest("Cette conversation ne porte pas sur une annonce");

        var offre = new OffrePrix
        {
            IdAnnonce = conversation.IdAnnonce.Value,
            IdPersonneAcheteur = idPersonne,
            IdPersonneVendeur = conversation.IdPersonneVendeur,
            OfrMontant = montant,
            OfrStatut = StatutOffrePrix.EN_ATTENTE,
            IdConversation = idConversation,
        };
        db.OffresPrix.Add(offre);
        await db.SaveChangesAsync();

        var message = new Message { IdConversation = idConversation, IdPersonneExpediteur = idPersonne, MsgType = TypeMessage.OFFRE, IdOffrePrix = offre.IdOffrePrix };
        db.Messages.Add(message);
        await db.SaveChangesAsync();

        var dto = MessageDto.From(await db.Messages.Include(m => m.PersonneExpediteur).Include(m => m.OffrePrix).FirstAsync(m => m.IdMessage == message.IdMessage));
        await PushAsync(idConversation, "messageReceived", dto);
        return dto;
    }

    public async Task<OffrePrixDto> RespondOfferAsync(int idOffre, int idPersonne, bool accept)
    {
        var offre = await db.OffresPrix.FirstOrDefaultAsync(o => o.IdOffrePrix == idOffre) ?? throw ApiException.NotFound("Offre introuvable");
        if (offre.IdPersonneVendeur != idPersonne) throw ApiException.Forbidden();
        if (offre.OfrStatut != StatutOffrePrix.EN_ATTENTE) throw ApiException.Conflict("Cette offre a déjà été traitée");

        offre.OfrStatut = accept ? StatutOffrePrix.ACCEPTEE : StatutOffrePrix.REFUSEE;
        if (accept) offre.OfrDateAcceptation = DateTime.UtcNow;
        await db.SaveChangesAsync();

        if (offre.IdConversation is not null)
        {
            var texte = accept ? $"Offre acceptée à {offre.OfrMontant} €." : "Offre refusée.";
            var message = new Message { IdConversation = offre.IdConversation.Value, IdPersonneExpediteur = idPersonne, MsgType = TypeMessage.TEXTE, MsgContenu = texte };
            db.Messages.Add(message);
            await db.SaveChangesAsync();
            var dto = MessageDto.From(await db.Messages.Include(m => m.PersonneExpediteur).FirstAsync(m => m.IdMessage == message.IdMessage));
            await PushAsync(offre.IdConversation.Value, "messageReceived", dto);
            await PushAsync(offre.IdConversation.Value, "offerUpdated", OffrePrixDto.From(offre));
        }
        return OffrePrixDto.From(offre);
    }
}
