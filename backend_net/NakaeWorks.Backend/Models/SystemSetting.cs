using System.ComponentModel.DataAnnotations;

namespace NakaeWorks.Backend.Models;

public class SystemSetting
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string Key { get; set; } = string.Empty; // e.g., "tax_percentage", "platform_fee"

    [Required]
    public string Value { get; set; } = string.Empty; // e.g., "18", "49"

    public string Description { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
