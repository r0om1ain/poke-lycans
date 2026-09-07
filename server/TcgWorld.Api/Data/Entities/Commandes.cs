namespace TcgWorld.Api.Data.Entities;

public class Commande
{
    public int IdCommande { get; set; }
    public int IdAcheteur { get; set; }
    public Personne Acheteur { get; set; } = null!;
    public int IdVendeur { get; set; }
    public Personne Vendeur { get; set; } = null!;
    public int IdStatutCommande { get; set; }
    public StatutCommande StatutCommande { get; set; } = null!;
    public decimal CmdMontantTotal { get; set; }
    public decimal CmdFraisLivraison { get; set; }
    public decimal CmdFraisService { get; set; }

    // Snapshot de l'adresse utilisée pour cette commande
    public string? CmdAdresse { get; set; }
    public string? CmdCodePostal { get; set; }
    public string? CmdVille { get; set; }
    public string? CmdPays { get; set; }

    public DateTime CmdDateCreation { get; set; } = DateTime.UtcNow;
    public DateTime? CmdDateValidation { get; set; }
    public DateTime? CmdDateExpedition { get; set; }
    public DateTime? CmdDateReception { get; set; }
    public bool CmdFlgArchive { get; set; }

    public List<CommandeLigne> Lignes { get; set; } = [];
    public Expedition? Expedition { get; set; }
    public List<Evaluation> Evaluations { get; set; } = [];
}

public class CommandeLigne
{
    public int IdCommandeLigne { get; set; }
    public int IdCommande { get; set; }
    public Commande Commande { get; set; } = null!;
    public int IdAnnonce { get; set; }
    public Annonce Annonce { get; set; } = null!;
    public int CmlQuantite { get; set; }
    public decimal CmlPrixUnitaire { get; set; }
    public decimal CmlMontantTotal { get; set; }
    public DateTime CmlDateAjout { get; set; } = DateTime.UtcNow;
}

// Pas de ShippingMethod par vendeur (supprimé, décision utilisateur) : les
// informations de livraison réelles sont saisies ici par le vendeur au moment
// de l'expédition, pas choisies à l'avance au panier.
public class Expedition
{
    public int IdExpedition { get; set; }
    public int IdCommande { get; set; }
    public Commande Commande { get; set; } = null!;
    public string? ExpTransporteur { get; set; }
    public string? ExpNumeroSuivi { get; set; }
    public string? ExpModeLivraison { get; set; }
    public decimal? ExpFraisLivraison { get; set; }
    public DateTime? ExpDateExpedition { get; set; }
    public DateTime? ExpDateLivraisonPrevue { get; set; }
    public DateTime? ExpDateLivraison { get; set; }
    public ExpeditionStatut? ExpStatut { get; set; }
    public bool ExpFlgArchive { get; set; }
}
