using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TcgWorld.Api.Data;
using TcgWorld.Api.Dtos;
using TcgWorld.Api.Services;

namespace TcgWorld.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AppDbContext db, TokenService tokens) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<PersonneDto>> Register(RegisterRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Pseudo) || string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.MotDePasse))
            throw ApiException.BadRequest("Pseudo, email et mot de passe sont requis");

        if (await db.Personnes.AnyAsync(p => p.PrsPseudo == req.Pseudo))
            throw ApiException.Conflict("Ce pseudo est déjà utilisé");
        if (await db.Personnes.AnyAsync(p => p.PrsEmail == req.Email))
            throw ApiException.Conflict("Cet email est déjà utilisé");

        var personne = new Data.Entities.Personne
        {
            PrsPseudo = req.Pseudo,
            PrsEmail = req.Email,
            PrsMotDePasseHash = BCrypt.Net.BCrypt.HashPassword(req.MotDePasse),
            PrsNom = req.Nom,
            PrsPrenom = req.Prenom,
        };
        db.Personnes.Add(personne);
        await db.SaveChangesAsync();

        tokens.SetAuthCookie(Response, personne);
        return PersonneDto.From(personne);
    }

    [HttpPost("login")]
    public async Task<ActionResult<PersonneDto>> Login(LoginRequest req)
    {
        var personne = await db.Personnes.FirstOrDefaultAsync(p => p.PrsEmail == req.Email && !p.PrsFlgArchive);
        if (personne is null || !BCrypt.Net.BCrypt.Verify(req.MotDePasse, personne.PrsMotDePasseHash))
            throw ApiException.Unauthorized("Email ou mot de passe incorrect");

        personne.PrsDateDerniereConnexion = DateTime.UtcNow;
        await db.SaveChangesAsync();

        tokens.SetAuthCookie(Response, personne);
        return PersonneDto.From(personne);
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        tokens.ClearAuthCookie(Response);
        return NoContent();
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<PersonneDto>> Me()
    {
        var personne = await db.Personnes.FindAsync(User.PersonId());
        if (personne is null) throw ApiException.Unauthorized();
        return PersonneDto.From(personne);
    }
}
