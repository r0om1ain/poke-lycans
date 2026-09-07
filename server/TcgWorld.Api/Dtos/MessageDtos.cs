using TcgWorld.Api.Data.Entities;

namespace TcgWorld.Api.Dtos;

public record ConversationDto(int Id, VendeurResumeDto Acheteur, VendeurResumeDto Vendeur, int? IdAnnonce, int? IdEnchere, int? IdCommande, DateTime DateCreation)
{
    public static ConversationDto From(Conversation c) => new(c.IdConversation, VendeurResumeDto.From(c.PersonneAcheteur), VendeurResumeDto.From(c.PersonneVendeur), c.IdAnnonce, c.IdEnchere, c.IdCommande, c.ConDateCreation);
}

public record OffrePrixDto(int Id, decimal Montant, string Statut, DateTime DateCreation)
{
    public static OffrePrixDto From(OffrePrix o) => new(o.IdOffrePrix, o.OfrMontant, o.OfrStatut.ToString(), o.OfrDateCreation);
}

public record MessageDto(int Id, int IdConversation, VendeurResumeDto Expediteur, string Type, string? Contenu, string? Image, OffrePrixDto? Offre, DateTime DateCreation)
{
    public static MessageDto From(Message m) => new(m.IdMessage, m.IdConversation, VendeurResumeDto.From(m.PersonneExpediteur), m.MsgType.ToString(), m.MsgContenu, m.MsgImage, m.OffrePrix is null ? null : OffrePrixDto.From(m.OffrePrix), m.MsgDateCreation);
}

public record ContactRequest(int? IdPersonneVendeur, int? IdAnnonce, int? IdEnchere, int? IdCommande);
public record SendTextRequest(string Contenu);
public record MakeOfferRequest(decimal Montant);
public record RespondOfferRequest(bool Accept);
