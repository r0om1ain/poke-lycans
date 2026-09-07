namespace TcgWorld.Api.Data.Entities;

// datConversation/datMessage/datOffrePrix — tables ajoutées en plus du DBML fourni
// par l'utilisateur (décision explicite : la messagerie/négociation de prix est
// conservée, voir addendum du plan). Même style de nommage que le reste du schéma.

public class Conversation
{
    public int IdConversation { get; set; }
    public int IdPersonneAcheteur { get; set; }
    public Personne PersonneAcheteur { get; set; } = null!;
    public int IdPersonneVendeur { get; set; }
    public Personne PersonneVendeur { get; set; } = null!;
    public int? IdAnnonce { get; set; }
    public Annonce? Annonce { get; set; }
    public int? IdEnchere { get; set; }
    public Enchere? Enchere { get; set; }
    public int? IdCommande { get; set; }
    public Commande? Commande { get; set; }
    public DateTime ConDateCreation { get; set; } = DateTime.UtcNow;

    public List<Message> Messages { get; set; } = [];
    public List<OffrePrix> OffresPrix { get; set; } = [];
}

public class Message
{
    public int IdMessage { get; set; }
    public int IdConversation { get; set; }
    public Conversation Conversation { get; set; } = null!;
    public int IdPersonneExpediteur { get; set; }
    public Personne PersonneExpediteur { get; set; } = null!;
    public TypeMessage MsgType { get; set; } = TypeMessage.TEXTE;
    public string? MsgContenu { get; set; }
    public string? MsgImage { get; set; }

    // Référence d'affichage vers la négociation en cours (l'état vit dans OffrePrix)
    public int? IdOffrePrix { get; set; }
    public OffrePrix? OffrePrix { get; set; }

    public DateTime MsgDateCreation { get; set; } = DateTime.UtcNow;
}

// Garantit qu'une offre acceptée est liée à UNE annonce, UN acheteur, et ne peut
// être utilisée qu'une fois (consommation atomique EN_ATTENTE/ACCEPTEE → UTILISEE
// au checkout).
public class OffrePrix
{
    public int IdOffrePrix { get; set; }
    public int IdAnnonce { get; set; }
    public Annonce Annonce { get; set; } = null!;
    public int IdPersonneAcheteur { get; set; }
    public Personne PersonneAcheteur { get; set; } = null!;
    public int IdPersonneVendeur { get; set; }
    public Personne PersonneVendeur { get; set; } = null!;
    public decimal OfrMontant { get; set; }
    public StatutOffrePrix OfrStatut { get; set; } = StatutOffrePrix.EN_ATTENTE;
    public int? IdConversation { get; set; }
    public Conversation? Conversation { get; set; }
    public DateTime OfrDateCreation { get; set; } = DateTime.UtcNow;
    public DateTime? OfrDateAcceptation { get; set; }
    public DateTime? OfrDateExpiration { get; set; }
    public DateTime? OfrDateUtilisation { get; set; }

    public List<Message> Messages { get; set; } = [];
}
