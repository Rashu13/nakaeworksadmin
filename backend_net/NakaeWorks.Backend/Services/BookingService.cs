using NakaeWorks.Backend.Data;
using NakaeWorks.Backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace NakaeWorks.Backend.Services;

public class BookingService
{
    private readonly ApplicationDbContext _context;

    public BookingService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<string> GenerateBookingNumber()
    {
        var lastBooking = await _context.Bookings
            .OrderByDescending(b => b.Id)
            .FirstOrDefaultAsync();

        var nextNumber = lastBooking != null ? lastBooking.Id + 1001 : 1001;
        return $"BK{nextNumber}";
    }

    public decimal CalculateTax(decimal subtotal, decimal platformFees)
    {
        // Dynamic tax percentage
        var taxSetting = _context.SystemSettings.FirstOrDefault(s => s.Key == "tax_percentage");
        decimal taxPercent = taxSetting != null && decimal.TryParse(taxSetting.Value, out var val) ? val : 18m;

        return Math.Round((subtotal + platformFees) * (taxPercent / 100m), 2);
    }

    public decimal GetPlatformFees()
    {
        // Dynamic platform fee
        var feeSetting = _context.SystemSettings.FirstOrDefault(s => s.Key == "platform_fee");
        return feeSetting != null && decimal.TryParse(feeSetting.Value, out var val) ? val : 49m;
    }

    public async Task<(bool isValid, decimal discountAmount, string? message)> ValidateAndApplyCoupon(
        string couponCode, 
        decimal subtotal, 
        long userId)
    {
        var coupon = await _context.Coupons
            .FirstOrDefaultAsync(c => c.Code == couponCode);

        if (coupon == null)
            return (false, 0, "Invalid coupon code");

        if (!coupon.Status)
            return (false, 0, "Coupon is inactive");

        if (coupon.ExpiresAt.HasValue && coupon.ExpiresAt.Value < DateTime.UtcNow)
            return (false, 0, "Coupon has expired");

        if (coupon.StartDate.HasValue && coupon.StartDate.Value > DateTime.UtcNow)
            return (false, 0, "Coupon is not yet active");

        if (subtotal < coupon.MinOrderValue)
            return (false, 0, $"Minimum order value is ₹{coupon.MinOrderValue}");

        if (coupon.UsageLimit.HasValue && coupon.UsedCount >= coupon.UsageLimit.Value)
            return (false, 0, "Coupon usage limit reached");

        // Check customer type eligibility
        if (coupon.CustomerType != "all")
        {
            var bookingCount = await _context.Bookings
                .Where(b => b.ConsumerId == userId && b.BookingStatusId == 4) // Completed bookings
                .CountAsync();

            if (coupon.CustomerType == "new" && bookingCount > 0)
                return (false, 0, "Coupon is only for new customers");

            if (coupon.CustomerType == "existing" && bookingCount == 0)
                return (false, 0, "Coupon is only for existing customers");

            if (coupon.MaxPastOrders.HasValue && bookingCount > coupon.MaxPastOrders.Value)
                return (false, 0, $"Maximum {coupon.MaxPastOrders.Value} past orders allowed");
        }

        // Calculate discount
        decimal discountAmount = 0;
        if (coupon.DiscountType == "fixed")
        {
            discountAmount = coupon.DiscountValue;
        }
        else if (coupon.DiscountType == "percentage")
        {
            discountAmount = (subtotal * coupon.DiscountValue) / 100;
            if (coupon.MaxDiscount.HasValue)
            {
                discountAmount = Math.Min(discountAmount, coupon.MaxDiscount.Value);
            }
        }

        return (true, discountAmount, null);
    }

    public async Task IncrementCouponUsage(string couponCode)
    {
        var coupon = await _context.Coupons
            .FirstOrDefaultAsync(c => c.Code == couponCode);

        if (coupon != null)
        {
            coupon.UsedCount++;
            await _context.SaveChangesAsync();
        }
    }

    public (decimal subtotal, decimal tax, decimal platformFees, decimal totalAmount) CalculateBookingPrice(
        decimal servicePrice,
        decimal serviceDiscount,
        decimal couponDiscount)
    {
        var subtotal = servicePrice - serviceDiscount;
        var platformFees = GetPlatformFees();
        var tax = CalculateTax(subtotal, platformFees);
        var totalAmount = subtotal + tax + platformFees - couponDiscount;

        // Ensure not negative
        if (totalAmount < 0) totalAmount = 0;

        return (subtotal, tax, platformFees, totalAmount);
    }

    public (decimal subtotal, decimal tax, decimal platformFees, decimal totalAmount) CalculateMultiItemBookingPrice(
        List<BookingItem> items,
        decimal couponDiscount)
    {
        decimal itemsSubtotal = items.Sum(i => i.Total);

        var platformFees = GetPlatformFees();
        var tax = CalculateTax(itemsSubtotal, platformFees);
        var totalAmount = itemsSubtotal + tax + platformFees - couponDiscount;

        if (totalAmount < 0) totalAmount = 0;

        return (itemsSubtotal, tax, platformFees, totalAmount);
    }
}
