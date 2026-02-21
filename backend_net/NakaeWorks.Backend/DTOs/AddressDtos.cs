using System.ComponentModel.DataAnnotations;

namespace NakaeWorks.Backend.DTOs;

public class AddressDto
{
    public long Id { get; set; }
    public string AddressLine1 { get; set; } = string.Empty;
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Pincode { get; set; }
    public string? Country { get; set; }
    public string Type { get; set; } = "home";
    public bool IsPrimary { get; set; }
}

public class CreateAddressDto
{
    [Required]
    public string AddressLine1 { get; set; } = string.Empty; // Maps to AddressLine

    public string? City { get; set; }
    public string? State { get; set; }
    public string? Pincode { get; set; }
    public string? Country { get; set; }
    public string? Latitude { get; set; }
    public string? Longitude { get; set; }
    public string Type { get; set; } = "home";
    public bool IsPrimary { get; set; }
}
