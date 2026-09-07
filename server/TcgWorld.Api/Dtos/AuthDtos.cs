using TcgWorld.Api.Data.Entities;

namespace TcgWorld.Api.Dtos;

public record RegisterRequest(string Pseudo, string Email, string MotDePasse, string Nom, string Prenom);
public record LoginRequest(string Email, string MotDePasse);

public record PersonneDto(
    int Id, string Pseudo, string Email, string Nom, string Prenom, string? Telephone,
    string? Adresse, string? CodePostal, string? Ville, string? Pays, string Role, DateTime DateCreation)
{
    public static PersonneDto From(Personne p) => new(
        p.IdPersonne, p.PrsPseudo, p.PrsEmail, p.PrsNom, p.PrsPrenom, p.PrsTelephone,
        p.PrsAdresse, p.PrsCodePostal, p.PrsVille, p.PrsPays, p.PrsRole, p.PrsDateCreation);
}

public record UpdateProfileRequest(
    string? Nom, string? Prenom, string? Telephone, string? Adresse, string? CodePostal, string? Ville, string? Pays);
