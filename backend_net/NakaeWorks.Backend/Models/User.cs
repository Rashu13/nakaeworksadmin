using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NakaeWorks.Backend.Models;

public enum UserRole
{
    Consumer,
    Provider,
    Admin,
    Serviceman
}

[Table("users")]
public class User
{
    [Key]
    public long Id { get; set; }

    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string Password { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Phone { get; set; }

    [Column(TypeName = "varchar(50)")]
    public string Role { get; set; } = "consumer";

    [Column("status")]
    public bool Status { get; set; } = true;

    [Column("is_verified")]
    public bool IsVerified { get; set; } = false;

    [MaxLength(255)]
    public string? Avatar { get; set; }

    [Column(TypeName = "text")]
    public string? About { get; set; }

    public int Served { get; set; } = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<Address> Addresses { get; set; } = new List<Address>();
}
