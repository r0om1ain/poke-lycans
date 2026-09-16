namespace TcgWorld.Api.Dtos;

// DTOs exposés par AnalyticsExportController — consommés par le pipeline ELT Airflow
// (MarketplaceAPIHook) à la place de l'API Flask simulée du cahier des charges.
// Volontairement plats (pas de nav properties) : ce sont des exports pour un data lake,
// pas des réponses pour le frontend.

public record ExportOrderLineDto(
    int AnnonceId, string ProductType, int ProductId, string ProductName, string Category,
    int Quantite, decimal PrixUnitaire, decimal MontantTotal);

public record ExportOrderDto(
    int OrderId, DateOnly Dt, int SellerId, int BuyerId, string StatusCode,
    decimal TotalAmount, decimal ShippingFee, decimal ServiceFee,
    List<ExportOrderLineDto> Lines);

public record ExportSellerDto(int SellerId, string Name, string? Country, DateTime JoinedDate);

public record ExportProductDto(int ProductId, string Name, string Category, int SellerId, decimal Price);
