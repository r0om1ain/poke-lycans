using Microsoft.AspNetCore.SignalR;

namespace TcgWorld.Api.Hubs;

// Un groupe par conversation. Remplace le polling 5s de l'ancien client
// (`setInterval(load, 5000)` dans AccountMessages.jsx) : le client rejoint le
// groupe à l'ouverture d'une conversation et reçoit "messageReceived" /
// "offerUpdated" en direct.
public class MessagesHub : Hub
{
    public async Task JoinConversation(string conversationId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, GroupName(conversationId));
    }

    public async Task LeaveConversation(string conversationId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupName(conversationId));
    }

    public static string GroupName(string conversationId) => $"conversation:{conversationId}";
}
