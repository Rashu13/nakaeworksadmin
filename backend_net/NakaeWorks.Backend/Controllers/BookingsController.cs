using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NakaeWorks.Backend.Data;
using NakaeWorks.Backend.DTOs;
using NakaeWorks.Backend.Models;
using System.Security.Claims;
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

        // Get service details
        var service = await _context.Services.FindAsync(dto.ServiceId);
        if (service == null) return BadRequest(new { message = "Service not found" });

        // Verify address belongs to user
        var address = await _context.Addresses
            .FirstOrDefaultAsync(a => a.Id == dto.AddressId && a.UserId == consumerId);
        if (address == null) return BadRequest(new { message = "Address not found or doesn't belong to you" });

        // Get pending status
        var pendingStatus = await _context.BookingStatuses.FirstOrDefaultAsync(s => s.Slug == "pending");
        if (pendingStatus == null) return StatusCode(500, new { message = "Booking status 'pending' not found" });

        // Calculate pricing
        decimal servicePrice = service.Price;
        decimal serviceDiscount = service.Discount;
        decimal couponDiscount = 0;

        // Handle Coupon Logic
        if (!string.IsNullOrEmpty(dto.CouponCode))
        {
            var subtotalForCoupon = servicePrice - serviceDiscount;
            var (isValid, discountAmount, message) = await _bookingService.ValidateAndApplyCoupon(
                dto.CouponCode, subtotalForCoupon, consumerId);

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
        var (subtotal, tax, platformFees, totalAmount) = _bookingService.CalculateBookingPrice(
            servicePrice, serviceDiscount, couponDiscount);

        // Generate booking number
        var bookingNumber = await _bookingService.GenerateBookingNumber();

        var booking = new Booking
        {
            BookingNumber = bookingNumber,
            ConsumerId = consumerId,
            ProviderId = dto.ProviderId,
            ServiceId = dto.ServiceId,
            AddressId = dto.AddressId,
            BookingStatusId = pendingStatus.Id,
            DateTime = DateTime.SpecifyKind(dto.DateTime, DateTimeKind.Utc), // Fix for Postgres
            ServicePrice = servicePrice,
            Tax = tax,
            Discount = couponDiscount + serviceDiscount,
            PlatformFees = platformFees,
            Subtotal = subtotal,
            TotalAmount = totalAmount,
            PaymentMethod = "cod",
            PaymentStatus = "pending",
            Description = dto.Description ?? (dto.CouponCode != null ? $"Coupon Applied: {dto.CouponCode}" : ""),
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
            .Include(b => b.Service)
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
            .Include(b => b.Service)
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
