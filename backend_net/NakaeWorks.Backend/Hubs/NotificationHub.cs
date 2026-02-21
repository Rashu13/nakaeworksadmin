using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace NakaeWorks.Backend.Hubs;

public class NotificationHub : Hub
{
    // Map userId to connectionId if needed, or just use Groups
    private static readonly ConcurrentDictionary<string, string> _userConnections = new();

    public override Task OnConnectedAsync()
    {
        var httpContext = Context.GetHttpContext();
        var userId = httpContext?.Request.Query["userId"];
        
        if (!string.IsNullOrEmpty(userId))
        {
             Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
             // _userConnections.TryAdd(userId, Context.ConnectionId); // Optional
             Console.WriteLine($"User {userId} connected to SignalR Group user_{userId}");
        }

        return base.OnConnectedAsync();
    }

    public async Task JoinRoom(string userId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
        await Clients.Caller.SendAsync("Joined", $"Joined group user_{userId}");
    }
    
    // Method to be called by backend services to notify users
    // In practice, controllers will inject IHubContext<NotificationHub> and call Clients.Group(...).
}
