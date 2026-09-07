namespace TcgWorld.Api.Data.Entities;

public class Panier
{
    public int IdPanier { get; set; }
    public int IdPersonne { get; set; }
    public Personne Personne { get; set; } = null!;
    public DateTime PnrDateCreation { get; set; } = DateTime.UtcNow;
    public DateTime? PnrDateModification { get; set; }

    public List<PanierLigne> Lignes { get; set; } = [];
}

public class PanierLigne
{
    public int IdPanierLigne { get; set; }
    public int IdPanier { get; set; }
    public Panier Panier { get; set; } = null!;
    public int IdAnnonce { get; set; }
    public Annonce Annonce { get; set; } = null!;
    public int PnlQuantite { get; set; } = 1;
    public decimal PnlPrixUnitaire { get; set; }
    public DateTime PnlDateAjout { get; set; } = DateTime.UtcNow;
}
