using TcgWorld.Api.Data.Entities;

namespace TcgWorld.Api.Dtos;

public record CommandeLigneDto(int Id, ProduitResumeDto Produit, int Quantite, decimal PrixUnitaire, decimal MontantTotal);

public record ExpeditionDto(string? Transporteur, string? NumeroSuivi, string? ModeLivraison, decimal? Frais, string? Statut, DateTime? DateExpedition, DateTime? DateLivraison)
{
    public static ExpeditionDto From(Expedition e) => new(e.ExpTransporteur, e.ExpNumeroSuivi, e.ExpModeLivraison, e.ExpFraisLivraison, e.ExpStatut?.ToString(), e.ExpDateExpedition, e.ExpDateLivraison);
}

public record CommandeDto(
    int Id, VendeurResumeDto Acheteur, VendeurResumeDto Vendeur, string Statut,
    decimal MontantTotal, decimal FraisLivraison, decimal FraisService,
    string? Adresse, string? CodePostal, string? Ville, string? Pays,
    List<CommandeLigneDto> Lignes, ExpeditionDto? Expedition, DateTime DateCreation);

// Le checkout ne propose plus de choix de transporteur (ShippingMethod supprimé) :
// l'acheteur donne juste son adresse de livraison à cette étape.
public record CheckoutRequest(string Adresse, string CodePostal, string Ville, string Pays);

public record ReviewRequest(int Note, string? Commentaire);
public record ExpedierRequest(string? Transporteur, string? NumeroSuivi, string? ModeLivraison, decimal? Frais);
