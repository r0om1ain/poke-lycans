namespace TcgWorld.Api.Data.Entities;

// datEnchere — pas de colonne "prix courant" : pendant que l'enchère est ACTIVE, le
// prix courant se déduit de la meilleure datMiseEnchere (ou EncPrixDepart si aucune
// mise). EncPrixFinal n'est renseigné qu'à la clôture.
public class Enchere
{
    public int IdEnchere { get; set; }
    public int IdPersonne { get; set; }
    public Personne Personne { get; set; } = null!;
    public int? IdCarte { get; set; }
    public Carte? Carte { get; set; }
    public int? IdItem { get; set; }
    public Item? Item { get; set; }
    public int? IdLangue { get; set; }
    public Langue? Langue { get; set; }
    public int? IdPersonneGagnant { get; set; }
    public Personne? PersonneGagnant { get; set; }
    public string? EncDescription { get; set; }
    public decimal EncPrixDepart { get; set; }
    public decimal? EncPrixReserve { get; set; }
    public decimal? EncPrixFinal { get; set; }
    public DateTime EncDateDebut { get; set; } = DateTime.UtcNow;
    public DateTime EncDateFin { get; set; }
    public DateTime? EncDateCloture { get; set; }
    public EnchereStatut EncStatut { get; set; } = EnchereStatut.ACTIVE;
    public bool EncFlgArchive { get; set; }
    public DateTime EncDateCreation { get; set; } = DateTime.UtcNow;

    public EnchereCarte? EnchereCarte { get; set; }
    public List<MiseEnchere> Mises { get; set; } = [];
    public List<PhotoEnchere> Photos { get; set; } = [];
}

public class EnchereCarte
{
    public int IdEnchereCarte { get; set; }
    public int IdEnchere { get; set; }
    public Enchere Enchere { get; set; } = null!;
    public EtatCarte? EncEtat { get; set; }
    public bool EncFlgEdition1 { get; set; }
    public bool EncFlgHolo { get; set; }
    public bool EncFlgReverse { get; set; }
    public bool EncFlgStamp { get; set; }
    public bool EncFlgPokeball { get; set; }
    public bool EncFlgMisscut { get; set; }
    public bool EncFlgMissprint { get; set; }
    public bool EncFlgGrade { get; set; }
    public int? IdSocieteGradation { get; set; }
    public SocieteGradation? SocieteGradation { get; set; }
    public decimal? EncNoteGradation { get; set; }
}

public class MiseEnchere
{
    public int IdMiseEnchere { get; set; }
    public int IdEnchere { get; set; }
    public Enchere Enchere { get; set; } = null!;
    public int IdPersonne { get; set; }
    public Personne Personne { get; set; } = null!;
    public decimal MisMontant { get; set; }
    public DateTime MisDate { get; set; } = DateTime.UtcNow;
    public bool MisFlgGagnante { get; set; }
}

public class PhotoEnchere
{
    public int IdPhotoEnchere { get; set; }
    public int IdEnchere { get; set; }
    public Enchere Enchere { get; set; } = null!;
    public string PheChemin { get; set; } = "";
    public int? PheOrdre { get; set; }
    public bool PheFlgPrincipale { get; set; }
    public DateTime PheDateAjout { get; set; } = DateTime.UtcNow;
}
