namespace TcgWorld.Api.Data.Entities;

// datAnnonce — exactement une des deux FK IdCarte/IdItem est renseignée.
public class Annonce
{
    public int IdAnnonce { get; set; }
    public int IdPersonne { get; set; }
    public Personne Personne { get; set; } = null!;
    public int? IdCarte { get; set; }
    public Carte? Carte { get; set; }
    public int? IdItem { get; set; }
    public Item? Item { get; set; }
    public int? IdLangue { get; set; }
    public Langue? Langue { get; set; }
    public decimal AnnPrix { get; set; }
    public int AnnQuantite { get; set; } = 1;
    public string? AnnDescription { get; set; }
    public AnnonceStatut AnnStatut { get; set; } = AnnonceStatut.ACTIVE;
    public bool AnnFlgMiseEnAvant { get; set; }
    public DateTime AnnDateCreation { get; set; } = DateTime.UtcNow;
    public DateTime? AnnDateModification { get; set; }
    public bool AnnFlgArchive { get; set; }

    public AnnonceCarte? AnnonceCarte { get; set; }
    public List<PhotoAnnonce> Photos { get; set; } = [];
}

// Caractéristiques d'exemplaire — uniquement pertinentes quand Annonce.IdCarte est renseigné.
public class AnnonceCarte
{
    public int IdAnnonceCarte { get; set; }
    public int IdAnnonce { get; set; }
    public Annonce Annonce { get; set; } = null!;
    public EtatCarte? AncEtat { get; set; }
    public bool AncFlgEdition1 { get; set; }
    public bool AncFlgHolo { get; set; }
    public bool AncFlgReverse { get; set; }
    public bool AncFlgStamp { get; set; }
    public bool AncFlgPokeball { get; set; }
    public bool AncFlgMisscut { get; set; }
    public bool AncFlgMissprint { get; set; }
    public bool AncFlgGrade { get; set; }
    public int? IdSocieteGradation { get; set; }
    public SocieteGradation? SocieteGradation { get; set; }
    public decimal? AncNoteGradation { get; set; }
}

public class PhotoAnnonce
{
    public int IdPhotoAnnonce { get; set; }
    public int IdAnnonce { get; set; }
    public Annonce Annonce { get; set; } = null!;
    public string PhoChemin { get; set; } = "";
    public int? PhoOrdre { get; set; }
    public bool PhoFlgPrincipale { get; set; }
    public DateTime PhoDateAjout { get; set; } = DateTime.UtcNow;
}
