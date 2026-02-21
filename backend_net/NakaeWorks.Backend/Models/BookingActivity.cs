using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NakaeWorks.Backend.Models;

[Table("booking_activities")]
public class BookingActivity
{
    [Key]
    public long Id { get; set; }

    [Column("booking_id")]
    public long BookingId { get; set; }
    [ForeignKey("BookingId")]
    public Booking? Booking { get; set; }

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = string.Empty;

    [Column(TypeName = "text")]
    public string? Note { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
