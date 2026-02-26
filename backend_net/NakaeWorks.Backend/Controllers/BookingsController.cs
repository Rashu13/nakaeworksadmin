using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NakaeWorks.Backend.Data;
using NakaeWorks.Backend.DTOs;
using NakaeWorks.Backend.Models;
using System.Security.Claims;
using System.Linq;
using AppUser = NakaeWorks.Backend.Models.User;

namespace NakaeWorks.Backend.Controllers;

[Route("api/bookings")]
[ApiController]
[Authorize]
public class BookingsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly NakaeWorks.Backend.Services.BookingService _bookingService;

    public BookingsController(ApplicationDbContext context, NakaeWorks.Backend.Services.BookingService bookingService)
    {
        _context = context;
        _bookingService = bookingService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto dto)
    {
        var userIdStr = User.FindFirst("id")?.Value;
        if (userIdStr == null) return Unauthorized();
        long consumerId = long.Parse(userIdStr);

        // Prepare items list
        var bookingItems = new List<BookingItem>();
        
        // Handle legacy single service if items is empty
        if ((dto.Items == null || !dto.Items.Any()) && dto.ServiceId.HasValue)
        {
            dto.Items = new List<CartItemDto> { new CartItemDto { ServiceId = dto.ServiceId.Value, Quantity = 1 } };
        }

        if (dto.Items == null || !dto.Items.Any())
        {
            return BadRequest(new { message = "At least one service must be selected" });
        }

        // Fetch services and validate
        foreach (var item in dto.Items)
        {
            var service = await _context.Services.FindAsync(item.ServiceId);
            if (service == null) return BadRequest(new { message = $"Service with ID {item.ServiceId} not found" });

            // Calculate item price (treating discount as percentage as per common practice, 
            // but keeping it simple to match previous logic where it might be amount)
            // Let's check: if service.Discount < 100, treat as percentage, else treat as amount?
            // Existing logic was subtotal = price - discount. Let's stick to that for now for safety.
            decimal discountedPrice = service.Price - service.Discount;
            if (discountedPrice < 0) discountedPrice = 0;

            bookingItems.Add(new BookingItem
            {
                ServiceId = item.ServiceId,
                Quantity = item.Quantity,
                Price = service.Price,
                Total = discountedPrice * item.Quantity
            });
        }

        // Verify address belongs to user
        var address = await _context.Addresses
            .FirstOrDefaultAsync(a => a.Id == dto.AddressId && a.UserId == consumerId);
        if (address == null) return BadRequest(new { message = "Address not found or doesn't belong to you" });

        // Get pending status
        var pendingStatus = await _context.BookingStatuses.FirstOrDefaultAsync(s => s.Slug == "pending");
        if (pendingStatus == null) return StatusCode(500, new { message = "Booking status 'pending' not found" });

        decimal itemsSubtotal = bookingItems.Sum(i => i.Total);
        decimal couponDiscount = 0;

        // Handle Coupon Logic
        if (!string.IsNullOrEmpty(dto.CouponCode))
        {
            var (isValid, discountAmount, message) = await _bookingService.ValidateAndApplyCoupon(
                dto.CouponCode, itemsSubtotal, consumerId);

            if (isValid)
            {
                couponDiscount = discountAmount;
                await _bookingService.IncrementCouponUsage(dto.CouponCode);
            }
            else
            {
                return BadRequest(new { message = message });
            }
        }

        // Final Calculations
        var (subtotal, tax, platformFees, totalAmount) = _bookingService.CalculateMultiItemBookingPrice(
            bookingItems, couponDiscount);

        // Generate booking number
        var bookingNumber = await _bookingService.GenerateBookingNumber();

        var booking = new Booking
        {
            BookingNumber = bookingNumber,
            ConsumerId = consumerId,
            ProviderId = dto.ProviderId,
            ServiceId = dto.Items.First().ServiceId, // Store first service for compatibility
            AddressId = dto.AddressId,
            BookingStatusId = pendingStatus.Id,
            DateTime = DateTime.SpecifyKind(dto.DateTime, DateTimeKind.Utc),
            ServicePrice = itemsSubtotal,
            Tax = tax,
            Discount = couponDiscount, // In multi-item, individual service discounts are already in items' totals
            PlatformFees = platformFees,
            Subtotal = subtotal,
            TotalAmount = totalAmount,
            PaymentMethod = dto.PaymentMethod,
            PaymentStatus = "pending",
            CouponCode = !string.IsNullOrEmpty(dto.CouponCode) && couponDiscount > 0 ? dto.CouponCode.ToUpper() : null,
            Description = dto.Description ?? (dto.CouponCode != null ? $"Coupon Applied: {dto.CouponCode}" : ""),
            Items = bookingItems,
            IsReviewed = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        // Record initial activity
        _context.BookingActivities.Add(new BookingActivity { BookingId = booking.Id, Status = "Booking Placed", Note = "Booking created by consumer", CreatedAt = DateTime.UtcNow });
        await _context.SaveChangesAsync();

        // Fetch complete booking with relations
        var completeBooking = await _context.Bookings
            .Include(b => b.Items).ThenInclude(i => i.Service)
            .Include(b => b.Address)
            .Include(b => b.BookingStatus)
            .Include(b => b.Provider)
            .FirstOrDefaultAsync(b => b.Id == booking.Id);

        return CreatedAtAction(nameof(GetBookingById), new { id = booking.Id }, completeBooking);
    }

    [HttpGet]
    public async Task<IActionResult> GetBookings()
    {
        var userIdStr = User.FindFirst("id")?.Value;
        if (userIdStr == null) return Unauthorized();
        long userId = long.Parse(userIdStr);
        string role = User.FindFirst("role")?.Value ?? "consumer";

        var query = _context.Bookings
            .Include(b => b.Service)
            .Include(b => b.Provider)
            .Include(b => b.Consumer)
            .Include(b => b.BookingStatus)
            .Include(b => b.Address)
            .AsQueryable();

        if (role == "consumer")
        {
            query = query.Where(b => b.ConsumerId == userId);
        }
        else if (role == "provider")
        {
            query = query.Where(b => b.ProviderId == userId);
        }

        var bookings = await query
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new BookingDto
            {
                Id = b.Id,
                BookingNumber = b.BookingNumber,
                ServiceName = b.Service != null ? b.Service.Name : "",
                ProviderName = b.Provider != null ? b.Provider.Name : "",
                ConsumerName = b.Consumer != null ? b.Consumer.Name : "",
                Status = b.BookingStatus != null ? b.BookingStatus.Name : "",
                DateTime = b.DateTime,
                ServicePrice = b.ServicePrice,
                Tax = b.Tax,
                PlatformFees = b.PlatformFees,
                Discount = b.Discount,
                Subtotal = b.Subtotal,
                TotalAmount = b.TotalAmount,
                PaymentStatus = b.PaymentStatus,
                PaymentMethod = b.PaymentMethod,
                Description = b.Description,
                Items = b.Items.Select(i => new BookingItemDto
                {
                    Id = i.Id,
                    ServiceId = i.ServiceId,
                    ServiceName = i.Service != null ? i.Service.Name : "Service",
                    Quantity = i.Quantity,
                    Price = i.Price,
                    Total = i.Total
                }).ToList(),
                Service = b.Service != null ? new SharedServiceDto 
                { 
                    Id = b.Service.Id, 
                    Name = b.Service.Name, 
                    Thumbnail = b.Service.Thumbnail,
                    Price = b.Service.Price
                } : null,
                Address = b.Address != null ? new SharedAddressDto 
                { 
                    Id = b.Address.Id, 
                    AddressLine1 = b.Address.AddressLine, 
                    City = b.Address.City,
                    State = b.Address.State
                } : null,
                BookingStatus = b.BookingStatus != null ? new SharedStatusDto 
                { 
                    Id = b.BookingStatus.Id, 
                    Name = b.BookingStatus.Name, 
                    Slug = b.BookingStatus.Slug 
                } : null
            })
            .ToListAsync();

        return Ok(bookings);
    }
    
    [HttpGet("{id}")]
    public async Task<IActionResult> GetBookingById(long id)
    {
         var b = await _context.Bookings
            .Include(b => b.Items).ThenInclude(i => i.Service)
            .Include(b => b.Provider)
            .Include(b => b.Consumer)
            .Include(b => b.BookingStatus)
            .Include(b => b.Address)
            .FirstOrDefaultAsync(b => b.Id == id);
            
         if (b == null) return NotFound();

         var bookingDto = new BookingDto
         {
             Id = b.Id,
             BookingNumber = b.BookingNumber,
             ServiceName = b.Service != null ? b.Service.Name : (b.Items.Any() ? b.Items.First().Service?.Name : ""),
             ProviderName = b.Provider != null ? b.Provider.Name : "",
             ConsumerName = b.Consumer != null ? b.Consumer.Name : "",
             Status = b.BookingStatus != null ? b.BookingStatus.Name : "",
             DateTime = b.DateTime,
             ServicePrice = b.ServicePrice,
             Tax = b.Tax,
             PlatformFees = b.PlatformFees,
             Discount = b.Discount,
             Subtotal = b.Subtotal,
             TotalAmount = b.TotalAmount,
             PaymentStatus = b.PaymentStatus,
             PaymentMethod = b.PaymentMethod,
             Description = b.Description,
             Items = b.Items.Select(i => new BookingItemDto
             {
                 Id = i.Id,
                 ServiceId = i.ServiceId,
                 ServiceName = i.Service != null ? i.Service.Name : "Service",
                 Quantity = i.Quantity,
                 Price = i.Price,
                 Total = i.Total
             }).ToList(),
             Service = b.Service != null ? new SharedServiceDto 
             { 
                 Id = b.Service.Id, 
                 Name = b.Service.Name, 
                 Thumbnail = b.Service.Thumbnail,
                 Price = b.Service.Price
             } : null,
             Address = b.Address != null ? new SharedAddressDto 
             { 
                 Id = b.Address.Id, 
                 AddressLine1 = b.Address.AddressLine, 
                 City = b.Address.City,
                 State = b.Address.State
             } : null,
             BookingStatus = b.BookingStatus != null ? new SharedStatusDto 
             { 
                 Id = b.BookingStatus.Id, 
                 Name = b.BookingStatus.Name, 
                 Slug = b.BookingStatus.Slug 
             } : null
         };

         return Ok(bookingDto);
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(long id, [FromBody] UpdateBookingStatusDto dto)
    {
        var booking = await _context.Bookings.FindAsync(id);
        if (booking == null) return NotFound();

        var status = await _context.BookingStatuses.FirstOrDefaultAsync(s => s.Slug == dto.Status);
        if (status == null) return BadRequest("Invalid status");

        booking.BookingStatusId = status.Id;
        booking.UpdatedAt = DateTime.UtcNow;

        _context.Bookings.Update(booking);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Status updated" });
    }

    [HttpPut("{id}/cancel")]
    public async Task<IActionResult> CancelBooking(long id)
    {
        var userIdStr = User.FindFirst("id")?.Value;
        if (userIdStr == null) return Unauthorized();
        long userId = long.Parse(userIdStr);
        string role = User.FindFirst("role")?.Value ?? "consumer";

        var booking = await _context.Bookings.FindAsync(id);
        if (booking == null) return NotFound(new { message = "Booking not found" });

        // Check ownership
        if (booking.ConsumerId != userId && booking.ProviderId != userId && role != "admin")
        {
            return Forbid();
        }

        // Get cancelled status
        var cancelledStatus = await _context.BookingStatuses.FirstOrDefaultAsync(s => s.Slug == "cancelled");
        if (cancelledStatus == null) return StatusCode(500, new { message = "Cancelled status not found" });

        booking.BookingStatusId = cancelledStatus.Id;
        booking.UpdatedAt = DateTime.UtcNow;

        _context.Bookings.Update(booking);
        _context.BookingActivities.Add(new BookingActivity { BookingId = booking.Id, Status = "Cancelled", Note = "Booking cancelled", CreatedAt = DateTime.UtcNow });
        await _context.SaveChangesAsync();

        return Ok(new { message = "Booking cancelled successfully" });
    }

    [HttpGet("{id}/timeline")]
    public async Task<IActionResult> GetBookingTimeline(long id)
    {
        var userIdStr = User.FindFirst("id")?.Value;
        if (userIdStr == null) return Unauthorized();
        long userId = long.Parse(userIdStr);

        var booking = await _context.Bookings.FindAsync(id);
        if (booking == null) return NotFound(new { message = "Booking not found" });

        // Verify ownership
        if (booking.ConsumerId != userId && booking.ProviderId != userId)
        {
            string role = User.FindFirst("role")?.Value ?? "consumer";
            if (role != "admin") return Forbid();
        }

        var activities = await _context.BookingActivities
            .Where(a => a.BookingId == id)
            .OrderBy(a => a.CreatedAt)
            .Select(a => new
            {
                a.Id,
                a.Status,
                a.Note,
                a.CreatedAt
            })
            .ToListAsync();

        return Ok(activities);
    }
}
