using System.ComponentModel.DataAnnotations;

namespace NakaeWorks.Backend.DTOs;

public class ProviderDashboardDto
{
    public int TotalBookings { get; set; }
    public int PendingBookings { get; set; }
    public int CompletedBookings { get; set; }
    public decimal TotalEarnings { get; set; }
    public decimal CurrentBalance { get; set; }
    public int TotalServices { get; set; }
    public List<BookingDto> RecentBookings { get; set; } = new();
}

public class EarningDto
{
    public decimal TotalEarnings { get; set; }
    public decimal PendingWithdrawal { get; set; } // Simplified
    public List<TransactionDto> RecentTransactions { get; set; } = new();
}

public class TransactionDto
{
    public long Id { get; set; }
    public decimal Amount { get; set; }
    public string Type { get; set; } = string.Empty; // Credit/Debit
    public string? Detail { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class RejectBookingDto
{
    public string? Reason { get; set; }
}
