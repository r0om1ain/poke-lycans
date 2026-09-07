namespace TcgWorld.Api.Data.Entities;

// Persistance serveur des "vus récemment" (remplace le localStorage client de la
// première passe) — exactement une des deux FK IdCarte/IdItem est renseignée.
public class VueRecente
{
    public int IdVueRecente { get; set; }
    public int IdPersonne { get; set; }
    public Personne Personne { get; set; } = null!;
    public int? IdCarte { get; set; }
    public Carte? Carte { get; set; }
    public int? IdItem { get; set; }
    public Item? Item { get; set; }
    public DateTime VrcDateVue { get; set; } = DateTime.UtcNow;
}
