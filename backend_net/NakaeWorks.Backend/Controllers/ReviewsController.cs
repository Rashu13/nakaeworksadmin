using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NakaeWorks.Backend.Data;
using NakaeWorks.Backend.DTOs;
using NakaeWorks.Backend.Models;
using System.Security.Claims;

namespace NakaeWorks.Backend.Controllers;

[Route("api/reviews")]
[ApiController]
public class ReviewsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ReviewsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("service/{serviceId}")]
    public async Task<IActionResult> GetServiceReviews(long serviceId)
    {
        var reviews = await _context.Reviews
            .Include(r => r.Consumer)
            .Where(r => r.ServiceId == serviceId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewDto
            {
                Id = r.Id,
                BookingId = r.BookingId,
                ServiceId = r.ServiceId,
                ProviderId = r.ProviderId,
                ConsumerId = r.ConsumerId,
                ConsumerName = r.Consumer != null ? r.Consumer.Name : "User",
                ConsumerAvatar = r.Consumer != null ? r.Consumer.Avatar : null,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();

        return Ok(reviews);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> AddReview([FromBody] CreateReviewDto dto)
    {
        var userIdStr = User.FindFirst("id")?.Value;
        if (userIdStr == null) return Unauthorized();
        long userId = long.Parse(userIdStr);

        var booking = await _context.Bookings
            .FirstOrDefaultAsync(b => b.Id == dto.BookingId && b.ConsumerId == userId);

        if (booking == null) return NotFound("Booking not found");
        if (booking.IsReviewed) return BadRequest("This booking has already been reviewed");

        var review = new Review
        {
            BookingId = dto.BookingId,
            ConsumerId = userId,
            ProviderId = booking.ProviderId,
            ServiceId = booking.ServiceId ?? 0,
            Rating = dto.Rating,
            Comment = dto.Comment,
            CreatedAt = DateTime.UtcNow
        };

        booking.IsReviewed = true;

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Review added successfully" });
    }
}
