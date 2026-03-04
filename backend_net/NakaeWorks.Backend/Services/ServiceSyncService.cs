using System.Net.Http.Json;
using NakaeWorks.Backend.Data;
using NakaeWorks.Backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace NakaeWorks.Backend.Services;

public class ServiceSyncService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<ServiceSyncService> _logger;

    public ServiceSyncService(HttpClient httpClient, ILogger<ServiceSyncService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task SyncServicesAsync(ApplicationDbContext context)
    {
        try
        {
            _logger.LogInformation("Starting service sync from nakaeworks.com...");
            
            // 1. Get a default provider ID (Admin or first Provider)
            var provider = await context.Users.FirstOrDefaultAsync(u => u.Role == "admin" || u.Role == "provider");
            if (provider == null)
            {
                _logger.LogWarning("No provider found in database. Cannot sync services without a provider.");
                return;
            }

            var response = await _httpClient.GetFromJsonAsync<NakaeServiceResponse>("https://nakaeworks.com/api/Servicelist");
            
            if (response != null && response.Status == 1 && response.Data != null)
            {
                foreach (var remote in response.Data)
                {
                    var slug = remote.ServiceName.ToLower().Replace(" ", "-").Replace("/", "-").Replace("&", "and").Replace("(", "").Replace(")", "");
                    
                    // Parse values
                    decimal.TryParse(remote.Price, NumberStyles.Any, CultureInfo.InvariantCulture, out decimal price);
                    decimal.TryParse(remote.Discount, NumberStyles.Any, CultureInfo.InvariantCulture, out decimal discount);

                    var existing = await context.Services.FirstOrDefaultAsync(s => s.Id == remote.Id);
                    
                    if (existing != null)
                    {
                        existing.Name = remote.ServiceName;
                        existing.Slug = slug;
                        existing.Description = remote.Description;
                        existing.Price = price;
                        existing.Discount = discount;
                        existing.CategoryId = remote.CategoryId;
                        existing.UpdatedAt = DateTime.UtcNow;
                        // We EXPLICITLY do NOT update Thumbnail/Image as requested
                        _logger.LogInformation($"Updated service: {existing.Name}");
                    }
                    else
                    {
                        var newService = new Service
                        {
                            Id = remote.Id,
                            Name = remote.ServiceName,
                            Slug = slug,
                            Description = remote.Description,
                            Price = price,
                            Discount = discount,
                            CategoryId = remote.CategoryId,
                            ProviderId = provider.Id,
                            Status = remote.Status == "Active",
                            Thumbnail = null, // Always null/empty as requested
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };
                        context.Services.Add(newService);
                        _logger.LogInformation($"Added new service: {newService.Name}");
                    }
                }

                await context.SaveChangesAsync();
                _logger.LogInformation("Service sync completed successfully.");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error syncing services from nakaeworks.com");
        }
    }

    private class NakaeServiceResponse
    {
        public string Message { get; set; } = string.Empty;
        public List<NakaeServiceData>? Data { get; set; }
        public int Status { get; set; }
    }

    private class NakaeServiceData
    {
        public long Id { get; set; }
        public string ServiceName { get; set; } = string.Empty;
        public long CategoryId { get; set; }
        public string Description { get; set; } = string.Empty;
        public string Price { get; set; } = string.Empty;
        public string Discount { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }
}
