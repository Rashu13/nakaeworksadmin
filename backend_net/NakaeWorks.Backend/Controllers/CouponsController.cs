using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NakaeWorks.Backend.Data;
using NakaeWorks.Backend.DTOs;
using NakaeWorks.Backend.Models;
using System.Security.Claims;

namespace NakaeWorks.Backend.Controllers;

[Route("api/coupons")]
[ApiController]
public class CouponsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly NakaeWorks.Backend.Services.BookingService _bookingService;

    public CouponsController(ApplicationDbContext context, NakaeWorks.Backend.Services.BookingService bookingService)
    {
        _context = context;
        _bookingService = bookingService;
    }

    // POST: api/coupons/validate
    [HttpPost("validate")]
    [Authorize]
    public async Task<IActionResult> ValidateCoupon([FromBody] ValidateCouponDto dto)
    {
        var userIdStr = User.FindFirst("id")?.Value;
        if (userIdStr == null) return Unauthorized();
        long userId = long.Parse(userIdStr);

        var (isValid, discountAmount, message) = await _bookingService.ValidateAndApplyCoupon(
            dto.Code, dto.OrderValue, userId);

        if (!isValid)
        {
            return BadRequest(new CouponValidationResponseDto
            {
                IsValid = false,
                Message = message,
                DiscountAmount = 0
            });
        }

        var coupon = await _context.Coupons.FirstOrDefaultAsync(c => c.Code == dto.Code);

        return Ok(new CouponValidationResponseDto
        {
            IsValid = true,
            Message = "Coupon is valid",
            DiscountAmount = discountAmount,
            DiscountType = coupon?.DiscountType
        });
    }

    // GET: api/coupons (Admin only)
    [HttpGet]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetCoupons()
    {
        var coupons = await _context.Coupons
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new CouponResponseDto
            {
                Id = c.Id,
                Code = c.Code,
                DiscountType = c.DiscountType,
                DiscountValue = c.DiscountValue,
                MinOrderValue = c.MinOrderValue,
                MaxDiscount = c.MaxDiscount,
                StartDate = c.StartDate,
                ExpiresAt = c.ExpiresAt,
                Status = c.Status,
                UsageLimit = c.UsageLimit,
                UsedCount = c.UsedCount,
                CustomerType = c.CustomerType
            })
            .ToListAsync();

        return Ok(coupons);
    }

    // POST: api/coupons (Admin only)
    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> CreateCoupon([FromBody] CreateCouponDto dto)
    {
        // Check if code already exists
        if (await _context.Coupons.AnyAsync(c => c.Code == dto.Code))
        {
            return BadRequest(new { message = "Coupon code already exists" });
        }

        var coupon = new Coupon
        {
            Code = dto.Code.ToUpper(),
            DiscountType = dto.DiscountType,
            DiscountValue = dto.DiscountValue,
            MinOrderValue = dto.MinOrderValue,
            MaxDiscount = dto.MaxDiscount,
            StartDate = dto.StartDate?.ToUniversalTime() ?? DateTime.UtcNow,
            ExpiresAt = dto.ExpiresAt?.ToUniversalTime(),
            Status = true,
            UsageLimit = dto.UsageLimit,
            UsageLimitPerUser = dto.UsageLimitPerUser,
            CustomerType = dto.CustomerType,
            MaxPastOrders = dto.MaxPastOrders,
            UsedCount = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Coupons.Add(coupon);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCoupons), new { id = coupon.Id }, new { message = "Coupon created", couponId = coupon.Id });
    }

    // PUT: api/coupons/{id} (Admin only)
    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateCoupon(long id, [FromBody] UpdateCouponDto dto)
    {
        var coupon = await _context.Coupons.FindAsync(id);
        if (coupon == null) return NotFound(new { message = "Coupon not found" });

        if (dto.Status.HasValue) coupon.Status = dto.Status.Value;
        if (dto.ExpiresAt.HasValue) coupon.ExpiresAt = dto.ExpiresAt.Value.ToUniversalTime();
        if (dto.UsageLimit.HasValue) coupon.UsageLimit = dto.UsageLimit.Value;

        coupon.UpdatedAt = DateTime.UtcNow;

        _context.Coupons.Update(coupon);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Coupon updated" });
    }

    // PATCH: api/coupons/{id}/status (Admin only)
    [HttpPatch("{id}/status")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> ToggleStatus(long id, [FromBody] UpdateStatusDto dto)
    {
        var coupon = await _context.Coupons.FindAsync(id);
        if (coupon == null) return NotFound(new { message = "Coupon not found" });

        coupon.Status = dto.Status;
        coupon.UpdatedAt = DateTime.UtcNow;

        _context.Coupons.Update(coupon);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Coupon status updated" });
    }

    // DELETE: api/coupons/{id} (Admin only)
    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteCoupon(long id)
    {
        var coupon = await _context.Coupons.FindAsync(id);
        if (coupon == null) return NotFound(new { message = "Coupon not found" });

        _context.Coupons.Remove(coupon);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Coupon deleted" });
    }
}
