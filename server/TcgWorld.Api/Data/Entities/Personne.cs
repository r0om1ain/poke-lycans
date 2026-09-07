namespace TcgWorld.Api.Data.Entities;

// datPersonne
public class Personne
{
    public int IdPersonne { get; set; }
    public string PrsNom { get; set; } = "";
    public string PrsPrenom { get; set; } = "";
    public string PrsPseudo { get; set; } = "";
    public string PrsEmail { get; set; } = "";
    public string PrsMotDePasseHash { get; set; } = "";
    public string? PrsTelephone { get; set; }
    public DateOnly? PrsDateNaissance { get; set; }
    public string? PrsAdresse { get; set; }
    public string? PrsCodePostal { get; set; }
    public string? PrsVille { get; set; }
    public string? PrsPays { get; set; }

    // Pas d'enum : "demande passage vendeur" est hors périmètre pour cette passe
    // (voir addendum du plan), le champ est juste porté tel quel.
    public string PrsRole { get; set; } = "Acheteur";

    public bool PrsFlgEmailVerifie { get; set; }
    public bool PrsFlgCompteVerifie { get; set; }
    public DateTime PrsDateCreation { get; set; } = DateTime.UtcNow;
    public DateTime? PrsDateDerniereConnexion { get; set; }
    public bool PrsFlgArchive { get; set; }
}
