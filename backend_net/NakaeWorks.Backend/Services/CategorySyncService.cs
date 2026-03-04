using System.Net.Http.Json;
using NakaeWorks.Backend.Data;
using NakaeWorks.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace NakaeWorks.Backend.Services;

public class CategorySyncService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<CategorySyncService> _logger;

    public CategorySyncService(HttpClient httpClient, ILogger<CategorySyncService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task SyncCategoriesAsync(ApplicationDbContext context)
    {
        try
        {
            _logger.LogInformation("Starting category sync from nakaeworks.com...");
            
            var response = await _httpClient.GetFromJsonAsync<NakaeCategoryResponse>("https://nakaeworks.com/api/getcategorylist");
            
            if (response != null && response.Status == 1 && response.Data != null)
            {
                foreach (var remoteCat in response.Data)
                {
                    var slug = remoteCat.CategoryName.ToLower().Replace(" ", "-").Replace("/", "-").Replace("&", "and");
                    
                    var existing = await context.Categories.FirstOrDefaultAsync(c => c.Id == remoteCat.Id);
                    
                    if (existing != null)
                    {
                        existing.Name = remoteCat.CategoryName;
                        existing.Slug = slug;
                        existing.Icon = remoteCat.Image;
                        existing.UpdatedAt = DateTime.UtcNow;
                        _logger.LogInformation($"Updated category: {existing.Name}");
                    }
                    else
                    {
                        var newCat = new Category
                        {
                            Id = remoteCat.Id,
                            Name = remoteCat.CategoryName,
                            Slug = slug,
                            Icon = remoteCat.Image,
                            Status = remoteCat.Status == "Active",
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };
                        context.Categories.Add(newCat);
                        _logger.LogInformation($"Added new category: {newCat.Name}");
                    }
                }

                await context.SaveChangesAsync();
                _logger.LogInformation("Category sync completed successfully.");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error syncing categories from nakaeworks.com");
        }
    }

    private class NakaeCategoryResponse
    {
        public string Message { get; set; } = string.Empty;
        public List<NakaeCategoryData>? Data { get; set; }
        public int Status { get; set; }
    }

    private class NakaeCategoryData
    {
        public long Id { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string Image { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }
}
