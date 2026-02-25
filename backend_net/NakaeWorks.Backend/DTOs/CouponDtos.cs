namespace NakaeWorks.Backend.DTOs;

// Coupon Validation
public class ValidateCouponDto
{
    public string Code { get; set; } = string.Empty;
    public decimal OrderValue { get; set; }
}

public class CouponValidationResponseDto
{
    public bool IsValid { get; set; }
    public string? Message { get; set; }
    public decimal DiscountAmount { get; set; }
    public string? DiscountType { get; set; }
}

// Coupon Management (Admin)
public class CreateCouponDto
{
    public string Code { get; set; } = string.Empty;
    public string DiscountType { get; set; } = "fixed"; // fixed or percentage
    public decimal DiscountValue { get; set; }
    public decimal MinOrderValue { get; set; } = 0;
    public decimal? MaxDiscount { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public int? UsageLimit { get; set; }
    public int UsageLimitPerUser { get; set; } = 1;
    public string CustomerType { get; set; } = "all"; // all, new, existing
    public int? MaxPastOrders { get; set; }
}

public class UpdateCouponDto
{
    public bool? Status { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public int? UsageLimit { get; set; }
}

public class UpdateStatusDto
{
    public bool Status { get; set; }
}

public class CouponResponseDto
{
    public long Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string DiscountType { get; set; } = string.Empty;
    public decimal DiscountValue { get; set; }
    public decimal MinOrderValue { get; set; }
    public decimal? MaxDiscount { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public bool Status { get; set; }
    public int? UsageLimit { get; set; }
    public int UsedCount { get; set; }
    public string CustomerType { get; set; } = string.Empty;
}
