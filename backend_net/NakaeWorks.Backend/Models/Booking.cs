using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NakaeWorks.Backend.Models;

[Table("booking_statuses")]
public class BookingStatus
{
    [Key]
    public long Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Slug { get; set; } = string.Empty;

    public int Sequence { get; set; } = 0;
}

[Table("bookings")]
public class Booking
{
    [Key]
    public long Id { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("booking_number")]
    public string BookingNumber { get; set; } = string.Empty;

    [Column("consumer_id")]
    public long ConsumerId { get; set; }
    [ForeignKey("ConsumerId")]
    public User? Consumer { get; set; }

    [Column("provider_id")]
    public long ProviderId { get; set; }
    [ForeignKey("ProviderId")]
    public User? Provider { get; set; }

    [Column("service_id")]
    public long? ServiceId { get; set; } // Optional for multiple services
    [ForeignKey("ServiceId")]
    public Service? Service { get; set; }

    public ICollection<BookingItem> Items { get; set; } = new List<BookingItem>();

    [Column("address_id")]
    public long AddressId { get; set; }
    [ForeignKey("AddressId")]
    public Address? Address { get; set; }

    [Column("booking_status_id")]
    public long BookingStatusId { get; set; }
    [ForeignKey("BookingStatusId")]
    public BookingStatus? BookingStatus { get; set; }

    [Column("date_time")]
    public DateTime DateTime { get; set; }

    [Column("service_price", TypeName = "decimal(10, 2)")]
    public decimal ServicePrice { get; set; }

    [Column(TypeName = "decimal(10, 2)")]
    public decimal Tax { get; set; }

    [Column(TypeName = "decimal(10, 2)")]
    public decimal Discount { get; set; }

    [Column("platform_fees", TypeName = "decimal(10, 2)")]
    public decimal PlatformFees { get; set; }

    [Column(TypeName = "decimal(10, 2)")]
    public decimal Subtotal { get; set; }

    [Column("total_amount", TypeName = "decimal(10, 2)")]
    public decimal TotalAmount { get; set; }

    [Column("payment_method")]
    [MaxLength(50)]
    public string PaymentMethod { get; set; } = "cod";

    [Column("payment_status", TypeName = "varchar(50)")]
    public string PaymentStatus { get; set; } = "pending";

    [Column(TypeName = "text")]
    public string? Description { get; set; }

    [Column("is_reviewed")]
    public bool IsReviewed { get; set; } = false;

    [Column("coupon_code")]
    [MaxLength(50)]
    public string? CouponCode { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
