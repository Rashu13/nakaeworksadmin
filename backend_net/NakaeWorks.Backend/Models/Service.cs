using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NakaeWorks.Backend.Models;

[Table("services")]
public class Service
{
    [Key]
    [Column("Id")]
    public long Id { get; set; }

    [Column("provider_id")]
    public long ProviderId { get; set; }

    [ForeignKey("ProviderId")]
    public User? Provider { get; set; }

    [Column("category_id")]
    public long CategoryId { get; set; }

    [ForeignKey("CategoryId")]
    public Category? Category { get; set; }

    [Required]
    [MaxLength(255)]
    [Column("Name")]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    [Column("Slug")]
    public string Slug { get; set; } = string.Empty;

    [Column(TypeName = "text")]
    public string? Description { get; set; }

    [Column(TypeName = "decimal(10, 2)")]
    public decimal Price { get; set; }

    [Column(TypeName = "decimal(10, 2)")]
    public decimal Discount { get; set; }

    public int Duration { get; set; } = 60;

    public bool Status { get; set; } = true;

    [Column("is_featured")]
    public bool IsFeatured { get; set; } = false;

    [MaxLength(255)]
    public string? Thumbnail { get; set; }

    [Column(TypeName = "varchar(50)")]
    public string Type { get; set; } = "fixed";

    [Column(TypeName = "jsonb")]
    public string? Faqs { get; set; }

    [Column(TypeName = "decimal(2, 1)")]
    public decimal Rating { get; set; } = 0.0m;

    [Column("review_count")]
    public int ReviewCount { get; set; } = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
