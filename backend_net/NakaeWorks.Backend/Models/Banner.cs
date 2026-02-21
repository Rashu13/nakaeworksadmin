using System.ComponentModel.DataAnnotations;

namespace NakaeWorks.Backend.Models;

public class Banner
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string ImageUrl { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Link { get; set; } = string.Empty; // Internal route or external URL

    public int Position { get; set; } = 0; // For ordering

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
