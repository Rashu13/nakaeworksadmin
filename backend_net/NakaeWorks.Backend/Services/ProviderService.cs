using NakaeWorks.Backend.Data;
using NakaeWorks.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace NakaeWorks.Backend.Services;

public class ProviderService
{
    private readonly ApplicationDbContext _context;

    public ProviderService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<object> GetDashboardStats(long providerId)
    {
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);
        var startOfMonth = new DateTime(today.Year, today.Month, 1);

        // Today's bookings count
        var todaysBookings = await _context.Bookings
            .Where(b => b.ProviderId == providerId && b.DateTime >= today && b.DateTime < tomorrow)
            .CountAsync();

        // Pending requests count
        var pendingRequests = await _context.Bookings
            .Where(b => b.ProviderId == providerId && b.BookingStatusId == 1)
            .CountAsync();

        // Total completed bookings
        var completedBookings = await _context.Bookings
            .Where(b => b.ProviderId == providerId && b.BookingStatusId == 4)
            .CountAsync();

        // Total earnings
        var totalEarnings = await _context.Bookings
            .Where(b => b.ProviderId == providerId && b.BookingStatusId == 4 && b.PaymentStatus == "paid")
            .SumAsync(b => (decimal?)b.TotalAmount) ?? 0;

        // Monthly earnings
        var monthlyEarnings = await _context.Bookings
            .Where(b => b.ProviderId == providerId && b.BookingStatusId == 4 && 
                       b.PaymentStatus == "paid" && b.CreatedAt >= startOfMonth)
            .SumAsync(b => (decimal?)b.TotalAmount) ?? 0;

        // Average rating
        var ratingStats = await _context.Reviews
            .Where(r => r.ProviderId == providerId)
            .GroupBy(r => r.ProviderId)
            .Select(g => new { AvgRating = g.Average(r => r.Rating), TotalReviews = g.Count() })
            .FirstOrDefaultAsync();

        // Recent bookings
        var recentBookings = await _context.Bookings
            .Where(b => b.ProviderId == providerId)
            .Include(b => b.Consumer)
            .Include(b => b.Service)
            .Include(b => b.BookingStatus)
            .Include(b => b.Address)
            .OrderByDescending(b => b.CreatedAt)
            .Take(5)
            .Select(b => new
            {
                b.Id,
                b.BookingNumber,
                Consumer = new { b.Consumer!.Id, b.Consumer.Name, b.Consumer.Email, b.Consumer.Phone, b.Consumer.Avatar },
                Service = new { b.Service!.Id, b.Service.Name, b.Service.Thumbnail },
                Status = new { b.BookingStatus!.Id, b.BookingStatus.Name, b.BookingStatus.Slug },
                Address = new { b.Address!.AddressLine, b.Address.City },
                b.DateTime,
                b.TotalAmount,
                b.CreatedAt
            })
            .ToListAsync();

        return new
        {
            Success = true,
            Data = new
            {
                Stats = new
                {
                    TodaysBookings = todaysBookings,
                    PendingRequests = pendingRequests,
                    CompletedBookings = completedBookings,
                    TotalEarnings = totalEarnings,
                    MonthlyEarnings = monthlyEarnings,
                    AvgRating = ratingStats?.AvgRating.ToString("F1") ?? "0.0",
                    TotalReviews = ratingStats?.TotalReviews ?? 0
                },
                RecentBookings = recentBookings
            }
        };
    }

    public async Task<object> GetEarnings(long providerId, string period = "month")
    {
        var today = DateTime.UtcNow.Date;
        DateTime startDate;

        switch (period.ToLower())
        {
            case "week":
                startDate = today.AddDays(-7);
                break;
            case "year":
                startDate = new DateTime(today.Year, 1, 1);
                break;
            case "month":
            default:
                startDate = new DateTime(today.Year, today.Month, 1);
                break;
        }

        var periodEarnings = await _context.Bookings
            .Where(b => b.ProviderId == providerId && b.BookingStatusId == 4 && 
                       b.PaymentStatus == "paid" && b.CreatedAt >= startDate)
            .SumAsync(b => (decimal?)b.TotalAmount) ?? 0;

        var totalEarnings = await _context.Bookings
            .Where(b => b.ProviderId == providerId && b.BookingStatusId == 4 && b.PaymentStatus == "paid")
            .SumAsync(b => (decimal?)b.TotalAmount) ?? 0;

        var pendingEarnings = await _context.Bookings
            .Where(b => b.ProviderId == providerId && b.BookingStatusId == 4 && b.PaymentStatus == "pending")
            .SumAsync(b => (decimal?)b.TotalAmount) ?? 0;

        // Monthly breakdown for current year
        var yearStart = new DateTime(today.Year, 1, 1);
        var monthlyData = await _context.Bookings
            .Where(b => b.ProviderId == providerId && b.BookingStatusId == 4 && 
                       b.PaymentStatus == "paid" && b.CreatedAt >= yearStart)
            .GroupBy(b => b.CreatedAt.Month)
            .Select(g => new
            {
                Month = g.Key,
                Amount = g.Sum(b => b.TotalAmount),
                Bookings = g.Count()
            })
            .ToListAsync();

        return new
        {
            Success = true,
            Data = new
            {
                TotalEarnings = totalEarnings,
                PeriodEarnings = periodEarnings,
                PendingEarnings = pendingEarnings,
                Period = period,
                MonthlyBreakdown = monthlyData
            }
        };
    }
}
