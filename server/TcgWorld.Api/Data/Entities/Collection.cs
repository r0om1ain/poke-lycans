namespace TcgWorld.Api.Data.Entities;

public class Collection
{
    public int IdCollection { get; set; }
    public int IdPersonne { get; set; }
    public Personne Personne { get; set; } = null!;
    public DateTime ColDateCreation { get; set; } = DateTime.UtcNow;
    public DateTime? ColDateModification { get; set; }

    public List<CollectionCarte> Cartes { get; set; } = [];
    public List<CollectionItem> Items { get; set; } = [];
}

public class CollectionCarte
{
    public int IdCollectionCarte { get; set; }
    public int IdCollection { get; set; }
    public Collection Collection { get; set; } = null!;
    public int IdCarte { get; set; }
    public Carte Carte { get; set; } = null!;
    public int? IdLangue { get; set; }
    public Langue? Langue { get; set; }
    public int ColcQuantite { get; set; } = 1;
    public EtatCarte? ColcEtat { get; set; }
    public bool ColcFlgEdition1 { get; set; }
    public bool ColcFlgHolo { get; set; }
    public bool ColcFlgReverse { get; set; }
    public bool ColcFlgStamp { get; set; }
    public bool ColcFlgPokeball { get; set; }
    public bool ColcFlgMisscut { get; set; }
    public bool ColcFlgMissprint { get; set; }
    public bool ColcFlgGrade { get; set; }
    public int? IdSocieteGradation { get; set; }
    public SocieteGradation? SocieteGradation { get; set; }
    public decimal? ColcNoteGradation { get; set; }
    public DateTime ColcDateAjout { get; set; } = DateTime.UtcNow;
    public DateTime? ColcDateModification { get; set; }
}

// Produits scellés en collection — pas de caractéristiques d'exemplaire (holo,
// gradation...) puisque ça ne concerne que les cartes ; CliEtat reste une chaîne
// libre (ex. "Neuf scellé") plutôt que l'enum EtatCarte, concept différent.
public class CollectionItem
{
    public int IdCollectionItem { get; set; }
    public int IdCollection { get; set; }
    public Collection Collection { get; set; } = null!;
    public int IdItem { get; set; }
    public Item Item { get; set; } = null!;
    public int? IdLangue { get; set; }
    public Langue? Langue { get; set; }
    public int CliQuantite { get; set; } = 1;
    public string? CliEtat { get; set; }
    public DateTime CliDateAjout { get; set; } = DateTime.UtcNow;
    public DateTime? CliDateModification { get; set; }
}
