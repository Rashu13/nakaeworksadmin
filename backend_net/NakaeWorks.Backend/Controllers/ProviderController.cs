using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NakaeWorks.Backend.Data;
using NakaeWorks.Backend.DTOs;
using NakaeWorks.Backend.Models;
using System.Security.Claims;

namespace NakaeWorks.Backend.Controllers;

[Route("api/providers")]
[ApiController]
[Authorize(Roles = "provider")]
public class ProviderController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly NakaeWorks.Backend.Services.ProviderService _providerService;

    public ProviderController(ApplicationDbContext context, NakaeWorks.Backend.Services.ProviderService providerService)
    {
        _context = context;
        _providerService = providerService;
    }

    // ============================================
    // PUBLIC APIs (No Auth Required)
    // ============================================

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetProviders()
    {
        var providers = await _context.Users
            .Where(u => u.Role == "provider" && u.Status)
            .Select(u => new
            {
                u.Id,
                u.Name,
                u.Email,
                u.Phone,
                u.Avatar,
                u.About,
                u.Served,
                u.IsVerified,
                Rating = _context.Reviews.Where(r => r.ProviderId == u.Id).Average(r => (decimal?)r.Rating) ?? 4.5m,
                ReviewsCount = _context.Reviews.Count(r => r.ProviderId == u.Id),
                Location = u.Addresses.OrderByDescending(a => a.IsPrimary).Select(a => a.City).FirstOrDefault() ?? "Multiple Locations"
            })
            .ToListAsync();

        return Ok(providers);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetProviderById(long id)
    {
        var provider = await _context.Users
            .Where(u => u.Id == id && u.Role == "provider")
            .Select(u => new
            {
                u.Id,
                u.Name,
                u.Email,
                u.Phone,
                u.Avatar,
                u.About,
                u.Served,
                u.IsVerified,
                Rating = _context.Reviews.Where(r => r.ProviderId == u.Id).Average(r => (decimal?)r.Rating) ?? 4.5m,
                ReviewsCount = _context.Reviews.Count(r => r.ProviderId == u.Id),
                Location = u.Addresses.OrderByDescending(a => a.IsPrimary).Select(a => a.City).FirstOrDefault() ?? "Multiple Locations",
                Addresses = u.Addresses.Select(a => new { a.Id, AddressLine1 = a.AddressLine, a.City, a.State, a.IsPrimary }).ToList(),
                Services = _context.Services.Where(s => s.ProviderId == id && s.Status).ToList()
            })
            .FirstOrDefaultAsync();

        if (provider == null) return NotFound();

        return Ok(provider);
    }

    // ============================================
    // PROVIDER PANEL APIs
    // ============================================

    // GET: api/providers/dashboard
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var userIdStr = User.FindFirst("id")?.Value;
        if (userIdStr == null) return Unauthorized();
        long providerId = long.Parse(userIdStr);

        var dashboardData = await _providerService.GetDashboardStats(providerId);
        return Ok(dashboardData);
    }

    // GET: api/providers/bookings
    [HttpGet("bookings")]
    public async Task<IActionResult> GetBookings([FromQuery] string? status, [FromQuery] int page = 1, [FromQuery] int limit = 10)
    {
        var userIdStr = User.FindFirst("id")?.Value;
        if (userIdStr == null) return Unauthorized();
        long providerId = long.Parse(userIdStr);

        var query = _context.Bookings
            .Where(b => b.ProviderId == providerId)
            .Include(b => b.Consumer)
            .Include(b => b.Service)
            .Include(b => b.BookingStatus)
            .Include(b => b.Address)
            .AsQueryable();

        // Filter by status if provided
        if (!string.IsNullOrEmpty(status))
        {
            var statusMap = new Dictionary<string, long>
            {
                { "pending", 1 }, { "confirmed", 2 }, { "in_progress", 3 }, { "completed", 4 }, { "cancelled", 5 }
            };

            if (statusMap.ContainsKey(status.ToLower()))
            {
                query = query.Where(b => b.BookingStatusId == statusMap[status.ToLower()]);
            }
        }

        var totalCount = await query.CountAsync();
        var offset = (page - 1) * limit;

        var bookings = await query
            .OrderByDescending(b => b.CreatedAt)
            .Skip(offset)
            .Take(limit)
            .Select(b => new
            {
                b.Id,
                b.BookingNumber,
                Consumer = new { b.Consumer!.Id, b.Consumer.Name, b.Consumer.Email, b.Consumer.Phone, b.Consumer.Avatar },
                Service = new { b.Service!.Id, b.Service.Name, b.Service.Thumbnail, b.Service.Duration },
                Status = new { b.BookingStatus!.Id, b.BookingStatus.Name, b.BookingStatus.Slug },
                Address = new { b.Address!.Id, AddressLine1 = b.Address.AddressLine, address = b.Address.AddressLine, b.Address.City, b.Address.State, b.Address.Pincode, b.Address.Country },
                b.DateTime,
                b.TotalAmount,
                b.PaymentMethod,
                b.PaymentStatus,
                b.Description,
                b.CreatedAt
            })
            .ToListAsync();

        return Ok(new
        {
            Success = true,
            Data = new
            {
                Bookings = bookings,
                Pagination = new
                {
                    Total = totalCount,
                    Page = page,
                    Pages = (int)Math.Ceiling(totalCount / (double)limit)
                }
            }
        });
    }

    // PUT: api/providers/bookings/{id}/accept
    [HttpPut("bookings/{id}/accept")]
    public async Task<IActionResult> AcceptBooking(long id)
    {
        var userIdStr = User.FindFirst("id")?.Value;
        if (userIdStr == null) return Unauthorized();
        long providerId = long.Parse(userIdStr);

        var booking = await _context.Bookings.FirstOrDefaultAsync(b => b.Id == id && b.ProviderId == providerId);
        if (booking == null)
            return NotFound(new { success = false, message = "Booking not found" });

        if (booking.BookingStatusId != 1)
            return BadRequest(new { success = false, message = "Booking cannot be accepted" });

        booking.BookingStatusId = 2; // Accepted
        booking.UpdatedAt = DateTime.UtcNow;
        _context.BookingActivities.Add(new BookingActivity { BookingId = booking.Id, Status = "Confirmed", Note = "Booking accepted by provider", CreatedAt = DateTime.UtcNow });
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Booking accepted", data = booking });
    }

    // PUT: api/providers/bookings/{id}/reject
    [HttpPut("bookings/{id}/reject")]
    public async Task<IActionResult> RejectBooking(long id, [FromBody] RejectBookingDto dto)
    {
        var userIdStr = User.FindFirst("id")?.Value;
        if (userIdStr == null) return Unauthorized();
        long providerId = long.Parse(userIdStr);

        var booking = await _context.Bookings.FirstOrDefaultAsync(b => b.Id == id && b.ProviderId == providerId);
        if (booking == null)
            return NotFound(new { success = false, message = "Booking not found" });

        if (booking.BookingStatusId != 1)
            return BadRequest(new { success = false, message = "Booking cannot be rejected" });

        booking.BookingStatusId = 5; // Cancelled
        booking.Description = dto.Reason ?? "Rejected by provider";
        booking.UpdatedAt = DateTime.UtcNow;
        _context.BookingActivities.Add(new BookingActivity { BookingId = booking.Id, Status = "Rejected", Note = dto.Reason ?? "Rejected by provider", CreatedAt = DateTime.UtcNow });
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Booking rejected", data = booking });
    }

    // PUT: api/providers/bookings/{id}/start
    [HttpPut("bookings/{id}/start")]
    public async Task<IActionResult> StartService(long id)
    {
        var userIdStr = User.FindFirst("id")?.Value;
        if (userIdStr == null) return Unauthorized();
        long providerId = long.Parse(userIdStr);

        var booking = await _context.Bookings.FirstOrDefaultAsync(b => b.Id == id && b.ProviderId == providerId);
        if (booking == null)
            return NotFound(new { success = false, message = "Booking not found" });

        if (booking.BookingStatusId != 2)
            return BadRequest(new { success = false, message = "Booking must be accepted first" });

        booking.BookingStatusId = 3; // In Progress
        booking.UpdatedAt = DateTime.UtcNow;
        _context.BookingActivities.Add(new BookingActivity { BookingId = booking.Id, Status = "In Progress", Note = "Service started by provider", CreatedAt = DateTime.UtcNow });
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Service started", data = booking });
    }

    // PUT: api/providers/bookings/{id}/complete
    [HttpPut("bookings/{id}/complete")]
    public async Task<IActionResult> CompleteBooking(long id)
    {
        var userIdStr = User.FindFirst("id")?.Value;
        if (userIdStr == null) return Unauthorized();
        long providerId = long.Parse(userIdStr);

        var booking = await _context.Bookings.FirstOrDefaultAsync(b => b.Id == id && b.ProviderId == providerId);
        if (booking == null)
            return NotFound(new { success = false, message = "Booking not found" });

        if (booking.BookingStatusId != 3)
            return BadRequest(new { success = false, message = "Service must be in progress" });

        booking.BookingStatusId = 4; // Completed
        if (booking.PaymentMethod == "cod")
        {
            booking.PaymentStatus = "paid";
        }
        booking.UpdatedAt = DateTime.UtcNow;
        _context.BookingActivities.Add(new BookingActivity { BookingId = booking.Id, Status = "Completed", Note = "Service completed", CreatedAt = DateTime.UtcNow });
        await _context.SaveChangesAsync();

        // Increment provider's served count
        var provider = await _context.Users.FindAsync(providerId);
        if (provider != null)
        {
            provider.Served++;
            await _context.SaveChangesAsync();
        }

        return Ok(new { success = true, message = "Booking completed", data = booking });
    }

    // GET: api/providers/services
    [HttpGet("services")]
    public async Task<IActionResult> GetServices()
    {
        var userIdStr = User.FindFirst("id")?.Value;
        if (userIdStr == null) return Unauthorized();
        long providerId = long.Parse(userIdStr);

        var services = await _context.Services
            .Where(s => s.ProviderId == providerId)
            .Include(s => s.Category)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

        return Ok(new { success = true, data = services });
    }

    // POST: api/providers/services
    [HttpPost("services")]
    public async Task<IActionResult> AddService([FromBody] CreateServiceDto dto)
    {
        var userIdStr = User.FindFirst("id")?.Value;
        if (userIdStr == null) return Unauthorized();
        long providerId = long.Parse(userIdStr);

        var slug = dto.Name.ToLower().Replace(" ", "-").Replace("[^a-z0-9-]", "") + "-" + DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        var service = new Service
        {
            ProviderId = providerId,
            CategoryId = dto.CategoryId,
            Name = dto.Name,
            Slug = slug,
            Description = dto.Description,
            Price = dto.Price,
            Discount = dto.Discount ?? 0,
            Duration = dto.Duration ?? 60,
            Type = dto.Type ?? "fixed",
            Thumbnail = dto.Thumbnail,
            Status = true,
            IsFeatured = false,
            Rating = 0,
            ReviewCount = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Services.Add(service);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetServices), new { id = service.Id }, new { success = true, message = "Service added", data = service });
    }

    // PUT: api/providers/services/{id}
    [HttpPut("services/{id}")]
    public async Task<IActionResult> UpdateService(long id, [FromBody] UpdateServiceDto dto)
    {
        var userIdStr = User.FindFirst("id")?.Value;
        if (userIdStr == null) return Unauthorized();
        long providerId = long.Parse(userIdStr);

        var service = await _context.Services.FirstOrDefaultAsync(s => s.Id == id && s.ProviderId == providerId);
        if (service == null)
            return NotFound(new { success = false, message = "Service not found" });

        if (dto.Name != null) service.Name = dto.Name;
        if (dto.CategoryId.HasValue) service.CategoryId = dto.CategoryId.Value;
        if (dto.Description != null) service.Description = dto.Description;
        if (dto.Price.HasValue) service.Price = dto.Price.Value;
        if (dto.Discount.HasValue) service.Discount = dto.Discount.Value;
        if (dto.Duration.HasValue) service.Duration = dto.Duration.Value;
        if (dto.Type != null) service.Type = dto.Type;
        if (dto.Thumbnail != null) service.Thumbnail = dto.Thumbnail;
        if (dto.Status.HasValue) service.Status = dto.Status.Value;

        service.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Service updated", data = service });
    }

    // DELETE: api/providers/services/{id}
    [HttpDelete("services/{id}")]
    public async Task<IActionResult> DeleteService(long id)
    {
        var userIdStr = User.FindFirst("id")?.Value;
        if (userIdStr == null) return Unauthorized();
        long providerId = long.Parse(userIdStr);

        var service = await _context.Services.FirstOrDefaultAsync(s => s.Id == id && s.ProviderId == providerId);
        if (service == null)
            return NotFound(new { success = false, message = "Service not found" });

        service.Status = false; // Soft delete
        service.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Service deleted" });
    }

    // GET: api/providers/earnings
    [HttpGet("earnings")]
    public async Task<IActionResult> GetEarnings([FromQuery] string period = "month")
    {
        var userIdStr = User.FindFirst("id")?.Value;
        if (userIdStr == null) return Unauthorized();
        long providerId = long.Parse(userIdStr);

        var earningsData = await _providerService.GetEarnings(providerId, period);
        return Ok(earningsData);
    }

    // GET: api/providers/transactions
    [HttpGet("transactions")]
    public async Task<IActionResult> GetTransactionHistory([FromQuery] int page = 1, [FromQuery] int limit = 20)
    {
        var userIdStr = User.FindFirst("id")?.Value;
        if (userIdStr == null) return Unauthorized();
        long providerId = long.Parse(userIdStr);

        var offset = (page - 1) * limit;

        var query = _context.Bookings
            .Where(b => b.ProviderId == providerId && b.BookingStatusId == 4)
            .Include(b => b.Consumer)
            .Include(b => b.Service);

        var totalCount = await query.CountAsync();

        var transactions = await query
            .OrderByDescending(b => b.CreatedAt)
            .Skip(offset)
            .Take(limit)
            .Select(b => new
            {
                b.Id,
                b.BookingNumber,
                Consumer = new { b.Consumer!.Id, b.Consumer.Name },
                Service = new { b.Service!.Id, b.Service.Name },
                b.TotalAmount,
                b.PaymentMethod,
                b.PaymentStatus,
                b.CreatedAt
            })
            .ToListAsync();

        return Ok(new
        {
            Success = true,
            Data = new
            {
                Transactions = transactions,
                Pagination = new
                {
                    Total = totalCount,
                    Page = page,
                    Pages = (int)Math.Ceiling(totalCount / (double)limit)
                }
            }
        });
    }

    // GET: api/providers/reviews
    [HttpGet("reviews")]
    public async Task<IActionResult> GetReviews([FromQuery] int page = 1, [FromQuery] int limit = 10)
    {
        var userIdStr = User.FindFirst("id")?.Value;
        if (userIdStr == null) return Unauthorized();
        long providerId = long.Parse(userIdStr);

        var offset = (page - 1) * limit;

        var query = _context.Reviews
            .Where(r => r.ProviderId == providerId)
            .Include(r => r.Consumer)
            .Include(r => r.Service);

        var totalCount = await query.CountAsync();

        var reviews = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip(offset)
            .Take(limit)
            .Select(r => new
            {
                r.Id,
                Consumer = new { r.Consumer!.Id, r.Consumer.Name, r.Consumer.Avatar },
                Service = new { r.Service!.Id, r.Service.Name },
                r.Rating,
                r.Comment,
                r.CreatedAt
            })
            .ToListAsync();

        return Ok(new
        {
            Success = true,
            Data = new
            {
                Reviews = reviews,
                Pagination = new
                {
                    Total = totalCount,
                    Page = page,
                    Pages = (int)Math.Ceiling(totalCount / (double)limit)
                }
            }
        });
    }
}
