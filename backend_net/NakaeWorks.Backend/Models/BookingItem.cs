using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NakaeWorks.Backend.Models;

[Table("booking_items")]
public class BookingItem
{
    [Key]
    public long Id { get; set; }

    [Required]
    [Column("booking_id")]
    public long BookingId { get; set; }
    [ForeignKey("BookingId")]
    public Booking? Booking { get; set; }

    [Required]
    [Column("service_id")]
    public long ServiceId { get; set; }
    [ForeignKey("ServiceId")]
    public Service? Service { get; set; }

    [Required]
    public int Quantity { get; set; } = 1;

    [Required]
    [Column("price", TypeName = "decimal(10, 2)")]
    public decimal Price { get; set; } // Price captured at booking time

    [Required]
    [Column("total", TypeName = "decimal(10, 2)")]
    public decimal Total { get; set; }
}
