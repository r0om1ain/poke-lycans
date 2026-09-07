namespace TcgWorld.Api.Dtos;

public record SellerProfileDto(int Id, string Pseudo, DateTime DateCreation, decimal NoteMoyenne, int NombreEvaluations);

public record EvaluationDto(int Id, string AuteurPseudo, int Note, string? Commentaire, DateTime Date);
