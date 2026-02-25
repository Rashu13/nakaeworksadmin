using System.ComponentModel.DataAnnotations;

namespace NakaeWorks.Backend.DTOs;

public class CartItemDto
{
    public long ServiceId { get; set; }
    public int Quantity { get; set; } = 1;
}

public class CreateBookingDto
{
    // Support both single service (legacy) and multiple items
    public long? ServiceId { get; set; }
    
    public List<CartItemDto> Items { get; set; } = new();

    [Required]
    public long AddressId { get; set; }

    [Required]
    public long ProviderId { get; set; }

    [Required]
    public DateTime DateTime { get; set; }

    public string? Description { get; set; }
    public string? CouponCode { get; set; }
    public string PaymentMethod { get; set; } = "online";
}

public class AssignProviderDto
{
    public long ProviderId { get; set; }
}

public class BookingDto
{
    public long Id { get; set; }
    public string BookingNumber { get; set; } = string.Empty;
    public string? ServiceName { get; set; } // May be empty if multiple services
    public string ProviderName { get; set; } = string.Empty;
    public string ConsumerName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime DateTime { get; set; }
    public decimal ServicePrice { get; set; }
    public decimal Tax { get; set; }
    public decimal PlatformFees { get; set; }
    public decimal Discount { get; set; }
    public decimal Subtotal { get; set; }
    public decimal TotalAmount { get; set; }
    public string PaymentStatus { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public string? Description { get; set; }

    public List<BookingItemDto> Items { get; set; } = new();

    // Nested objects for frontend parity
    public SharedServiceDto? Service { get; set; }
    public SharedAddressDto? Address { get; set; }
    public SharedStatusDto? BookingStatus { get; set; }
}

public class BookingItemDto
{
    public long Id { get; set; }
    public long ServiceId { get; set; }
    public string ServiceName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public decimal Total { get; set; }
}

public class SharedServiceDto
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Thumbnail { get; set; }
    public decimal Price { get; set; }
}

public class SharedAddressDto
{
    public long Id { get; set; }
    public string? AddressLine1 { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Pincode { get; set; }
}

public class SharedStatusDto
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
}

public class UpdateBookingStatusDto
{
    [Required]
    public string Status { get; set; } = string.Empty;
}
