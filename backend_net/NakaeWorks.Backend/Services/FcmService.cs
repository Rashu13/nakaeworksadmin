using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;

namespace NakaeWorks.Backend.Services;

public interface IFcmService
{
    Task<bool> SendNotificationAsync(string to, string title, string body, object? data = null);
}

public class FcmService : IFcmService
{
    private readonly string _serverKey;
    private readonly HttpClient _httpClient;

    public FcmService(IConfiguration configuration)
    {
        _serverKey = configuration["Firebase:ServerKey"] ?? throw new ArgumentNullException("Firebase:ServerKey is missing");
        _httpClient = new HttpClient();
    }

    public async Task<bool> SendNotificationAsync(string to, string title, string body, object? data = null)
    {
        if (string.IsNullOrEmpty(to)) return false;

        var message = new
        {
            to = to,
            notification = new
            {
                title = title,
                body = body,
                sound = "default",
                click_action = "FLUTTER_NOTIFICATION_CLICK"
            },
            data = data
        };

        var json = JsonSerializer.Serialize(message);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        _httpClient.DefaultRequestHeaders.TryAddWithoutValidation("Authorization", $"key={_serverKey}");

        var response = await _httpClient.PostAsync("https://fcm.googleapis.com/fcm/send", content);
        
        return response.IsSuccessStatusCode;
    }
}
