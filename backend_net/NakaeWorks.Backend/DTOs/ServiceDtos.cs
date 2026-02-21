using System.ComponentModel.DataAnnotations;

namespace NakaeWorks.Backend.DTOs;

public class CategoryDto
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Icon { get; set; }
    public int ServicesCount { get; set; }
}

public class ServiceDto
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal Discount { get; set; }
    public int Duration { get; set; }
    public string? Thumbnail { get; set; }
    public string? Description { get; set; }
    public bool IsFeatured { get; set; }
    public long CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string CategorySlug { get; set; } = string.Empty;
    public long ProviderId { get; set; }
    public string ProviderName { get; set; } = string.Empty;
    public string? ProviderAvatar { get; set; }
    public double Rating { get; set; } = 0; // Calculated
    public int ReviewCount { get; set; } = 0; // Calculated
}

public class CreateServiceDto
{
    [Required]
    public long CategoryId { get; set; }
    
    [Required]
    public string Name { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    [Required]
    public decimal Price { get; set; }
    
    public decimal? Discount { get; set; }
    public int? Duration { get; set; }
    public string? Type { get; set; }
    public string? Thumbnail { get; set; }
    public long? ProviderId { get; set; }
}

public class UpdateServiceDto
{
    public string? Name { get; set; }
    public long? CategoryId { get; set; }
    public long? ProviderId { get; set; }
    public string? Description { get; set; }
    public decimal? Price { get; set; }
    public decimal? Discount { get; set; }
    public int? Duration { get; set; }
    public string? Type { get; set; }
    public string? Thumbnail { get; set; }
    public bool? Status { get; set; }
}
