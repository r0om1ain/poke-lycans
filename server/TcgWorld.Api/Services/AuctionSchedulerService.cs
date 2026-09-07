using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using TcgWorld.Api.Data;
using TcgWorld.Api.Data.Entities;
using TcgWorld.Api.Dtos;
using TcgWorld.Api.Hubs;

namespace TcgWorld.Api.Services;

// Clôture automatique des enchères expirées, toutes les 30s (miroir de
// server/src/services/auctionSchedulerService.js). Gagnant = meilleure mise si
// EncPrixReserve atteint ou absent, sinon pas de gagnant (réserve non atteinte).
public class AuctionSchedulerService(IServiceScopeFactory scopeFactory, ILogger<AuctionSchedulerService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(30));
        do
        {
            try { await CloseExpiredAuctionsAsync(); }
            catch (Exception ex) { logger.LogError(ex, "Erreur lors de la clôture automatique des enchères"); }
        } while (await timer.WaitForNextTickAsync(stoppingToken));
    }

    private async Task CloseExpiredAuctionsAsync()
    {
        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var hub = scope.ServiceProvider.GetRequiredService<IHubContext<AuctionsHub>>();

        var now = DateTime.UtcNow;
        var expirees = await db.Encheres
            .Where(e => e.EncStatut == EnchereStatut.ACTIVE && e.EncDateFin <= now)
            .Include(e => e.Mises)
            .Include(e => e.Carte!).ThenInclude(c => c.Serie)
            .Include(e => e.Item!).ThenInclude(i => i.Serie)
            .ToListAsync();

        foreach (var enchere in expirees)
        {
            var meilleureMise = enchere.Mises.OrderByDescending(m => m.MisMontant).FirstOrDefault();
            var reserveAtteinte = enchere.EncPrixReserve is null || (meilleureMise is not null && meilleureMise.MisMontant >= enchere.EncPrixReserve);
            var gagnant = meilleureMise is not null && reserveAtteinte;

            enchere.EncStatut = EnchereStatut.TERMINEE;
            enchere.EncDateCloture = now;
            if (gagnant)
            {
                meilleureMise!.MisFlgGagnante = true;
                enchere.IdPersonneGagnant = meilleureMise.IdPersonne;
                enchere.EncPrixFinal = meilleureMise.MisMontant;
            }
        }
        await db.SaveChangesAsync();

        foreach (var enchere in expirees)
        {
            var detail = EnchereDetailDto.From(enchere);
            await hub.Clients.Group(AuctionsHub.GroupName(enchere.IdEnchere.ToString())).SendAsync("auctionEnded", detail);
        }
    }
}
