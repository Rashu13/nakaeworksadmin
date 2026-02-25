using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NakaeWorks.Backend.Data;
using NakaeWorks.Backend.DTOs;
using NakaeWorks.Backend.Models;
using System.Security.Claims;

namespace NakaeWorks.Backend.Controllers;

[Route("api/admin")]
[ApiController]
[Authorize(Roles = "admin")]
public class AdminController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AdminController(ApplicationDbContext context)
    {
        _context = context;
    }

    // ============================================
    // DASHBOARD
    // ============================================

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var now = DateTime.UtcNow;
        var today = new DateTime(now.Year, now.Month, now.Day, 0, 0, 0, DateTimeKind.Utc);
        var thisMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        // Count statistics
        var totalUsers = await _context.Users.CountAsync();
        var totalProviders = await _context.Users.CountAsync(u => u.Role == "provider");
        var totalConsumers = await _context.Users.CountAsync(u => u.Role == "consumer");
        var totalServices = await _context.Services.CountAsync(s => s.Status);
        var totalBookings = await _context.Bookings.CountAsync();
        var todayBookings = await _context.Bookings.CountAsync(b => b.CreatedAt.Date == today);
        var pendingBookings = await _context.Bookings.CountAsync(b => b.BookingStatusId == 1);
        var completedBookings = await _context.Bookings.CountAsync(b => b.BookingStatusId == 4);

        // Revenue statistics
        var totalRevenue = await _context.Bookings
            .Where(b => b.BookingStatusId == 4)
            .SumAsync(b => b.TotalAmount);

        var monthlyRevenue = await _context.Bookings
            .Where(b => b.BookingStatusId == 4 && b.CreatedAt >= thisMonth)
            .SumAsync(b => b.TotalAmount);

        var todayRevenue = await _context.Bookings
            .Where(b => b.BookingStatusId == 4 && b.CreatedAt.Date == today)
            .SumAsync(b => b.TotalAmount);

        // Platform fees collected
        var totalPlatformFees = await _context.Bookings
            .Where(b => b.BookingStatusId == 4)
            .SumAsync(b => b.PlatformFees);

        // Recent bookings
        var recentBookings = await _context.Bookings
            .Include(b => b.Consumer)
            .Include(b => b.Provider)
            .Include(b => b.Service)
            .Include(b => b.BookingStatus)
            .OrderByDescending(b => b.CreatedAt)
            .Take(10)
            .Select(b => new
            {
                b.Id,
                b.BookingNumber,
                Consumer = new { b.Consumer!.Id, b.Consumer.Name, b.Consumer.Email },
                Provider = new { b.Provider!.Id, b.Provider.Name, b.Provider.Email },
                Service = new { b.Service!.Id, b.Service.Name },
                Status = new { b.BookingStatus!.Id, b.BookingStatus.Name, b.BookingStatus.Slug },
                b.TotalAmount,
                b.CreatedAt
            })
            .ToListAsync();

        // Monthly booking trend (last 6 months)
        var sixMonthsAgo = DateTime.UtcNow.AddMonths(-6);
        var monthlyTrend = await _context.Bookings
            .Where(b => b.CreatedAt >= sixMonthsAgo)
            .GroupBy(b => new { b.CreatedAt.Year, b.CreatedAt.Month })
            .Select(g => new
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                Count = g.Count(),
                Revenue = g.Where(b => b.BookingStatusId == 4).Sum(b => b.TotalAmount)
            })
            .OrderBy(x => x.Year).ThenBy(x => x.Month)
            .ToListAsync();

        return Ok(new
        {
            Success = true,
            Data = new
            {
                Statistics = new
                {
                    TotalUsers = totalUsers,
                    TotalProviders = totalProviders,
                    TotalConsumers = totalConsumers,
                    TotalServices = totalServices,
                    TotalBookings = totalBookings,
                    TodayBookings = todayBookings,
                    PendingBookings = pendingBookings,
                    CompletedBookings = completedBookings
                },
                Revenue = new
                {
                    Total = totalRevenue,
                    Monthly = monthlyRevenue,
                    Today = todayRevenue,
                    PlatformFees = totalPlatformFees
                },
                RecentBookings = recentBookings,
                MonthlyTrend = monthlyTrend
            }
        });
    }

    // ============================================
    // USER MANAGEMENT
    // ============================================

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers([FromQuery] string? role, [FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int limit = 20)
    {
        var query = _context.Users.AsQueryable();

        // Filter by role
        if (!string.IsNullOrEmpty(role))
        {
            query = query.Where(u => u.Role == role);
        }

        // Search
        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(u => u.Name.Contains(search) || u.Email.Contains(search) || (u.Phone != null && u.Phone.Contains(search)));
        }

        var totalCount = await query.CountAsync();
        var offset = (page - 1) * limit;

        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip(offset)
            .Take(limit)
            .Select(u => new
            {
                u.Id,
                u.Name,
                u.Email,
                u.Phone,
                u.Role,
                u.Status,
                u.Avatar,
                u.Served,
                u.CreatedAt
            })
            .ToListAsync();

        return Ok(new
        {
            Success = true,
            Data = new
            {
                Users = users,
                Pagination = new
                {
                    Total = totalCount,
                    Page = page,
                    Pages = (int)Math.Ceiling(totalCount / (double)limit)
                }
            }
        });
    }

    [HttpGet("users/{id}")]
    public async Task<IActionResult> GetUserById(long id)
    {
        var user = await _context.Users
            .Include(u => u.Addresses)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
            return NotFound(new { success = false, message = "User not found" });

        // Get user statistics
        var bookingsCount = user.Role == "provider"
            ? await _context.Bookings.CountAsync(b => b.ProviderId == id)
            : await _context.Bookings.CountAsync(b => b.ConsumerId == id);

        var servicesCount = user.Role == "provider"
            ? await _context.Services.CountAsync(s => s.ProviderId == id)
            : 0;

        var reviewsCount = user.Role == "provider"
            ? await _context.Reviews.CountAsync(r => r.ProviderId == id)
            : await _context.Reviews.CountAsync(r => r.ConsumerId == id);

        return Ok(new
        {
            Success = true,
            Data = new
            {
                User = user,
                Statistics = new
                {
                    BookingsCount = bookingsCount,
                    ServicesCount = servicesCount,
                    ReviewsCount = reviewsCount
                }
            }
        });
    }

    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
    {
        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            return BadRequest(new { success = false, message = "Email already registered" });

        var user = new User
        {
            Name = dto.Name,
            Email = dto.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Phone = dto.Phone,
            Role = dto.Role.ToLower(),
            Status = dto.Status,
            Avatar = dto.Avatar,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "User created successfully" });
    }

    [HttpPut("users/{id}")]
    public async Task<IActionResult> UpdateUser(long id, [FromBody] UpdateUserDto dto)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound(new { success = false, message = "User not found" });

        if (dto.Name != null) user.Name = dto.Name;
        if (dto.Email != null) user.Email = dto.Email;
        if (dto.Phone != null) user.Phone = dto.Phone;
        if (dto.Role != null) user.Role = dto.Role.ToLower();
        if (dto.Status.HasValue) user.Status = dto.Status.Value;
        if (dto.Avatar != null) user.Avatar = dto.Avatar;
        
        if (!string.IsNullOrEmpty(dto.Password))
        {
            user.Password = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        }

        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "User updated successfully" });
    }

    [HttpPut("users/{id}/status")]
    public async Task<IActionResult> UpdateUserStatus(long id, [FromBody] UpdateStatusDto dto)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound(new { success = false, message = "User not found" });

        user.Status = dto.Status;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "User status updated" });
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(long id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound(new { success = false, message = "User not found" });

        // Check if user is admin
        if (user.Role == "admin")
            return BadRequest(new { success = false, message = "Cannot delete admin user" });

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "User deleted" });
    }

    // ============================================
    // BOOKING MANAGEMENT
    // ============================================

    [HttpGet("bookings")]
    public async Task<IActionResult> GetBookings([FromQuery] string? status, [FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int limit = 20)
    {
        var query = _context.Bookings
            .Include(b => b.Consumer)
            .Include(b => b.Provider)
            .Include(b => b.Service)
            .Include(b => b.BookingStatus)
            .AsQueryable();

        // Filter by status
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

        // Search
        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(b => b.BookingNumber.Contains(search));
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
                Consumer = new { b.Consumer!.Id, b.Consumer.Name, b.Consumer.Email, b.Consumer.Phone },
                Provider = b.Provider != null ? new { b.Provider.Id, b.Provider.Name, b.Provider.Email, b.Provider.Phone } : null,
                Service = new { b.Service!.Id, b.Service.Name, b.Service.Thumbnail },
                Status = new { b.BookingStatus!.Id, b.BookingStatus.Name, b.BookingStatus.Slug },
                Address = b.Address != null ? new { b.Address.Id, AddressLine1 = b.Address.AddressLine, b.Address.City, b.Address.State, b.Address.Pincode, b.Address.Country, b.Address.Type } : null,
                b.DateTime,
                b.ServicePrice,
                b.Tax,
                b.Discount,
                b.Subtotal,
                b.TotalAmount,
                b.PlatformFees,
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

    [HttpGet("bookings/{id}")]
    public async Task<IActionResult> GetBookingById(long id)
    {
        var booking = await _context.Bookings
            .Include(b => b.Consumer)
            .Include(b => b.Provider)
            .Include(b => b.Service)
            .Include(b => b.BookingStatus)
            .Include(b => b.Address)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (booking == null)
            return NotFound(new { success = false, message = "Booking not found" });

        return Ok(new { success = true, data = booking });
    }

    [HttpPut("bookings/{id}/status")]
    public async Task<IActionResult> UpdateBookingStatus(long id, [FromBody] UpdateBookingStatusDto dto)
    {
        var booking = await _context.Bookings.FindAsync(id);
        if (booking == null)
            return NotFound(new { success = false, message = "Booking not found" });

        var status = await _context.BookingStatuses.FirstOrDefaultAsync(s => s.Slug == dto.Status);
        if (status == null)
            return BadRequest(new { success = false, message = "Invalid status" });

        booking.BookingStatusId = status.Id;
        booking.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Booking status updated" });
    }

    [HttpPut("bookings/{id}/assign")]
    public async Task<IActionResult> AssignProvider(long id, [FromBody] AssignProviderDto dto)
    {
        var booking = await _context.Bookings.FindAsync(id);
        if (booking == null)
            return NotFound(new { success = false, message = "Booking not found" });

        var provider = await _context.Users.FirstOrDefaultAsync(u => u.Id == dto.ProviderId && u.Role == "provider");
        if (provider == null)
            return BadRequest(new { success = false, message = "Invalid provider" });

        booking.ProviderId = dto.ProviderId;
        booking.BookingStatusId = 2; // Auto-accept/assign status, adjusting to 'Accepted' usually
        booking.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Provider assigned successfully" });
    }

    // ============================================
    // SERVICE MANAGEMENT
    // ============================================

    [HttpGet("services")]
    public async Task<IActionResult> GetServices([FromQuery] long? categoryId, [FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int limit = 20)
    {
        var servicesQuery = from s in _context.Services
                            join c in _context.Categories on s.CategoryId equals c.Id into catGroup
                            from c in catGroup.DefaultIfEmpty()
                            join p in _context.Users on s.ProviderId equals p.Id into provGroup
                            from p in provGroup.DefaultIfEmpty()
                            select new { s, c, p };

        // Filter by category
        if (categoryId.HasValue)
        {
            servicesQuery = servicesQuery.Where(x => x.s.CategoryId == categoryId.Value);
        }

        // Search
        if (!string.IsNullOrEmpty(search))
        {
            servicesQuery = servicesQuery.Where(x => x.s.Name.Contains(search) || (x.s.Description != null && x.s.Description.Contains(search)));
        }

        var totalCount = await servicesQuery.CountAsync();
        var offset = (page - 1) * limit;

        var services = await servicesQuery
            .OrderByDescending(x => x.s.CreatedAt)
            .Skip(offset)
            .Take(limit)
            .Select(x => new
            {
                x.s.Id,
                x.s.Name,
                x.s.Slug,
                x.s.Price,
                x.s.Discount,
                x.s.Duration,
                x.s.Thumbnail,
                x.s.Status,
                x.s.IsFeatured,
                x.s.Rating,
                x.s.ReviewCount,
                Category = x.c != null ? new { x.c.Id, x.c.Name } : null,
                Provider = x.p != null ? new { x.p.Id, x.p.Name } : null,
                x.s.CreatedAt
            })
            .ToListAsync();

        return Ok(new
        {
            Success = true,
            Data = new
            {
                Services = services,
                Pagination = new
                {
                    Total = totalCount,
                    Page = page,
                    Pages = (int)Math.Ceiling(totalCount / (double)limit)
                }
            }
        });
    }

    [HttpPost("services")]
    public async Task<IActionResult> CreateService([FromBody] CreateServiceDto dto)
    {
        var slug = dto.Name.ToLower().Replace(" ", "-");
        
        // Ensure slug is unique
        if (await _context.Services.AnyAsync(s => s.Slug == slug))
        {
            slug = $"{slug}-{Guid.NewGuid().ToString().Substring(0, 8)}";
        }

        var service = new Service
        {
            Name = dto.Name,
            Slug = slug,
            CategoryId = dto.CategoryId,
            ProviderId = dto.ProviderId ?? 0, // Should validate provider exists if not 0
            Description = dto.Description ?? "",
            Price = dto.Price,
            Discount = dto.Discount ?? 0,
            Duration = dto.Duration ?? 60,
            Thumbnail = dto.Thumbnail,
            Type = dto.Type ?? "fixed",
            Status = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Services.Add(service);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetServices), new { id = service.Id }, new { success = true, message = "Service created", data = service });
    }

    [HttpPut("services/{id}")]
    public async Task<IActionResult> UpdateService(long id, [FromBody] UpdateServiceDto dto)
    {
        var service = await _context.Services.FindAsync(id);
        if (service == null)
            return NotFound(new { success = false, message = "Service not found" });

        if (dto.Name != null)
        {
            service.Name = dto.Name;
            // Optionally update slug, but usually better to keep stable URLs unless requested
             var slug = dto.Name.ToLower().Replace(" ", "-");
             if (await _context.Services.AnyAsync(s => s.Slug == slug && s.Id != id))
             {
                 slug = $"{slug}-{Guid.NewGuid().ToString().Substring(0, 8)}";
             }
             service.Slug = slug;
        }

        if (dto.CategoryId.HasValue) service.CategoryId = dto.CategoryId.Value;
        if (dto.ProviderId.HasValue) service.ProviderId = dto.ProviderId.Value;
        if (dto.Description != null) service.Description = dto.Description;
        if (dto.Price.HasValue) service.Price = dto.Price.Value;
        if (dto.Discount.HasValue) service.Discount = dto.Discount.Value;
        if (dto.Duration.HasValue) service.Duration = dto.Duration.Value;
        if (dto.Thumbnail != null) service.Thumbnail = dto.Thumbnail;
        if (dto.Type != null) service.Type = dto.Type;
        if (dto.Status.HasValue) service.Status = dto.Status.Value;

        service.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Service updated", data = service });
    }

    [HttpPut("services/{id}/status")]
    public async Task<IActionResult> UpdateServiceStatus(long id, [FromBody] UpdateStatusDto dto)
    {
        var service = await _context.Services.FindAsync(id);
        if (service == null)
            return NotFound(new { success = false, message = "Service not found" });

        service.Status = dto.Status;
        service.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Service status updated" });
    }

    [HttpPut("services/{id}/featured")]
    public async Task<IActionResult> UpdateServiceFeatured(long id, [FromBody] UpdateFeaturedDto dto)
    {
        var service = await _context.Services.FindAsync(id);
        if (service == null)
            return NotFound(new { success = false, message = "Service not found" });

        service.IsFeatured = dto.IsFeatured;
        service.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Service featured status updated" });
    }

    [HttpDelete("services/{id}")]
    public async Task<IActionResult> DeleteService(long id)
    {
        var service = await _context.Services.FindAsync(id);
        if (service == null)
            return NotFound(new { success = false, message = "Service not found" });

        service.Status = false; // Soft delete
        service.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Service deleted" });
    }

    // ============================================
    // CATEGORY MANAGEMENT
    // ============================================

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _context.Categories
            .OrderBy(c => c.Name)
            .Select(c => new
            {
                c.Id,
                c.Name,
                c.Slug,
                c.Icon,
                c.Status,
                ServicesCount = _context.Services.Count(s => s.CategoryId == c.Id && s.Status),
                c.CreatedAt
            })
            .ToListAsync();

        return Ok(new { success = true, data = categories });
    }

    [HttpPost("categories")]
    public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryDto dto)
    {
        var slug = dto.Name.ToLower().Replace(" ", "-");

        // Check if slug exists
        if (await _context.Categories.AnyAsync(c => c.Slug == slug))
        {
            return BadRequest(new { success = false, message = "Category with this name already exists" });
        }

        var category = new Category
        {
            Name = dto.Name,
            Slug = slug,
            Icon = dto.Icon,
            Status = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCategories), new { id = category.Id }, new { success = true, message = "Category created", data = category });
    }

    [HttpPut("categories/{id}")]
    public async Task<IActionResult> UpdateCategory(long id, [FromBody] UpdateCategoryDto dto)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null)
            return NotFound(new { success = false, message = "Category not found" });

        if (dto.Name != null)
        {
            category.Name = dto.Name;
            category.Slug = dto.Name.ToLower().Replace(" ", "-");
        }

        if (dto.Icon != null) category.Icon = dto.Icon;
        if (dto.Status.HasValue) category.Status = dto.Status.Value;

        category.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Category updated", data = category });
    }

    [HttpDelete("categories/{id}")]
    public async Task<IActionResult> DeleteCategory(long id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null)
            return NotFound(new { success = false, message = "Category not found" });

        // Check if category has services
        var hasServices = await _context.Services.AnyAsync(s => s.CategoryId == id);
        if (hasServices)
        {
            return BadRequest(new { success = false, message = "Cannot delete category with existing services" });
        }

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Category deleted" });
    }

    // ============================================
    // REVIEWS MANAGEMENT
    // ============================================

    [HttpGet("reviews")]
    public async Task<IActionResult> GetReviews([FromQuery] int page = 1, [FromQuery] int limit = 20)
    {
        var offset = (page - 1) * limit;

        var query = _context.Reviews
            .Include(r => r.Consumer)
            .Include(r => r.Provider)
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
                Provider = new { r.Provider!.Id, r.Provider.Name },
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

    [HttpDelete("reviews/{id}")]
    public async Task<IActionResult> DeleteReview(long id)
    {
        var review = await _context.Reviews.FindAsync(id);
        if (review == null)
            return NotFound(new { success = false, message = "Review not found" });

        _context.Reviews.Remove(review);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Review deleted" });
    }
}
