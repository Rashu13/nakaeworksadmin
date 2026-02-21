using System.ComponentModel.DataAnnotations;

namespace NakaeWorks.Backend.Models;

public class Collection
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string Title { get; set; } = string.Empty;

    public string Type { get; set; } = "manual"; // "manual", "auto-bestseller", "auto-new", "auto-featured"

    public int Position { get; set; } = 0;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property for manual collections
    public List<CollectionItem> Items { get; set; } = new();
}
