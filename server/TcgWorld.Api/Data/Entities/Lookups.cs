namespace TcgWorld.Api.Data.Entities;

public class Langue
{
    public int IdLangue { get; set; }
    public string LngNom { get; set; } = "";
    public string LngCode { get; set; } = "";
    public bool LngFlgArchive { get; set; }
}

public class SocieteGradation
{
    public int IdSocieteGradation { get; set; }
    public string SgrNom { get; set; } = "";
    public string? SgrCode { get; set; }
    public bool SgrFlgArchive { get; set; }
}

// Vraie table de référence (pas un enum) — c'est ainsi que le statut de commande
// est modélisé dans le DBML fourni, contrairement aux autres statuts (annonce,
// enchère, expédition) qui restent des chaînes/enums applicatifs.
public class StatutCommande
{
    public int IdStatutCommande { get; set; }
    public string StcCode { get; set; } = "";
    public string StcNom { get; set; } = "";
    public int? StcOrdre { get; set; }
    public bool StcFlgArchive { get; set; }
}
