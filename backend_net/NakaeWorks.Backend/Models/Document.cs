using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NakaeWorks.Backend.Models;

[Table("documents")]
public class Document
{
    [Key]
    public long Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    public bool Status { get; set; } = true;

    [Column("is_required")]
    public bool IsRequired { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

[Table("user_documents")]
public class UserDocument
{
    [Key]
    public long Id { get; set; }

    [Column("user_id")]
    public long UserId { get; set; }
    [ForeignKey("UserId")]
    public User? User { get; set; }

    [Column("document_id")]
    public long DocumentId { get; set; }
    [ForeignKey("DocumentId")]
    public Document? Document { get; set; }

    [Column("identity_no")]
    [MaxLength(100)]
    public string? IdentityNo { get; set; }

    [Column("file_path")]
    [MaxLength(255)]
    public string? FilePath { get; set; }

    [Column(TypeName = "varchar(50)")]
    public string Status { get; set; } = "pending";

    [Column(TypeName = "text")]
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
