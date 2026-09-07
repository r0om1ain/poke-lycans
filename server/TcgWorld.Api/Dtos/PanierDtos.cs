namespace TcgWorld.Api.Dtos;

public record PanierLigneDto(int Id, AnnonceDto Annonce, int Quantite, decimal PrixUnitaire);
public record PanierVendeurDto(VendeurResumeDto Vendeur, List<PanierLigneDto> Lignes, decimal SousTotal);
public record PanierDto(List<PanierVendeurDto> Vendeurs, PanierSummaryDto Summary);
public record PanierSummaryDto(int NombreVendeurs, int NombreArticles, decimal ValeurTotale);

public record AddPanierRequest(int IdAnnonce, int Quantite);
public record UpdatePanierRequest(int Quantite);
