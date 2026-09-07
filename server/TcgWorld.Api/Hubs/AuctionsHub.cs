using Microsoft.AspNetCore.SignalR;

namespace TcgWorld.Api.Hubs;

// Un groupe par enchère. Pousse "bidPlaced" (nouvelle enchère) et
// "auctionEnded" (clôture) — remplace le besoin de rafraîchissement manuel
// sur AuctionDetail après le bid d'un autre utilisateur.
public class AuctionsHub : Hub
{
    public async Task JoinAuction(string auctionId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, GroupName(auctionId));
    }

    public async Task LeaveAuction(string auctionId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupName(auctionId));
    }

    public static string GroupName(string auctionId) => $"auction:{auctionId}";
}
