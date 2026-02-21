using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NakaeWorks.Backend.Models;

[Table("categories")]
public class Category
{
    [Key]
    [Column("Id")]
    public long Id { get; set; }

    [Required]
    [MaxLength(255)]
    [Column("Name")]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    [Column("Slug")]
    public string Slug { get; set; } = string.Empty;

    [MaxLength(255)]
    public string? Icon { get; set; }

    [Column(TypeName = "text")]
    public string? Description { get; set; }

    public bool Status { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
