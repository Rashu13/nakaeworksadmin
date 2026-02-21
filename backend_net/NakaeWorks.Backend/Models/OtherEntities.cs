using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NakaeWorks.Backend.Models;

[Table("reviews")]
public class Review
{
    [Key]
    public long Id { get; set; }

    [Column("booking_id")]
    public long BookingId { get; set; }
    [ForeignKey("BookingId")]
    public Booking? Booking { get; set; }

    [Column("consumer_id")]
    public long ConsumerId { get; set; }
    [ForeignKey("ConsumerId")]
    public User? Consumer { get; set; }

    [Column("provider_id")]
    public long ProviderId { get; set; }
    [ForeignKey("ProviderId")]
    public User? Provider { get; set; }

    [Column("service_id")]
    public long ServiceId { get; set; }
    [ForeignKey("ServiceId")]
    public Service? Service { get; set; }

    [Column(TypeName = "decimal(2, 1)")]
    public decimal Rating { get; set; }

    [Column(TypeName = "text")]
    public string? Comment { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

[Table("coupons")]
public class Coupon
{
    [Key]
    public long Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string Code { get; set; } = string.Empty;

    [Column("discount_type", TypeName = "varchar(50)")]
    public string DiscountType { get; set; } = "fixed";

    [Column("discount_value", TypeName = "decimal(10, 2)")]
    public decimal DiscountValue { get; set; }

    [Column("min_order_value", TypeName = "decimal(10, 2)")]
    public decimal MinOrderValue { get; set; } = 0.00m;

    [Column("max_discount", TypeName = "decimal(10, 2)")]
    public decimal? MaxDiscount { get; set; }

    [Column("start_date")]
    public DateTime? StartDate { get; set; }

    [Column("expires_at")]
    public DateTime? ExpiresAt { get; set; }

    public bool Status { get; set; } = true;

    [Column("usage_limit")]
    public int? UsageLimit { get; set; }

    [Column("usage_limit_per_user")]
    public int UsageLimitPerUser { get; set; } = 1;

    [Column("customer_type", TypeName = "varchar(50)")]
    public string CustomerType { get; set; } = "all";

    [Column("max_past_orders")]
    public int? MaxPastOrders { get; set; }

    [Column("used_count")]
    public int UsedCount { get; set; } = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

[Table("taxes")]
public class Tax
{
    [Key]
    public long Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string Name { get; set; } = string.Empty;

    [Column(TypeName = "decimal(8, 2)")]
    public decimal Rate { get; set; }

    public bool Status { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
