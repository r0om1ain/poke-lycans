namespace TcgWorld.Api.Data.Entities;

// EvaNote : note entière 1-5 (remplace l'ancien POSITIVE/NEUTRAL/NEGATIVE — décision
// prise faute de barème précisé dans le DBML, voir addendum du plan).
public class Evaluation
{
    public int IdEvaluation { get; set; }
    public int IdPersonneAuteur { get; set; }
    public Personne PersonneAuteur { get; set; } = null!;
    public int IdPersonneEvaluee { get; set; }
    public Personne PersonneEvaluee { get; set; } = null!;
    public int IdCommande { get; set; }
    public Commande Commande { get; set; } = null!;
    public int EvaNote { get; set; }
    public string? EvaCommentaire { get; set; }
    public DateTime EvaDateCreation { get; set; } = DateTime.UtcNow;
    public bool EvaFlgArchive { get; set; }
}
