namespace NakaeWorks.Backend.DTOs;

public class AdminDashboardDto
{
    public int TotalUsers { get; set; }
    public int TotalProviders { get; set; }
    public int TotalServices { get; set; }
    public int TotalBookings { get; set; }
    public decimal TotalRevenue { get; set; }
    public List<BookingDto> RecentBookings { get; set; } = new();
    public List<UserDto> RecentUsers { get; set; } = new();
}

public class UserDto
{
    public long Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool Status { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UpdateStatusDto
{
    public bool Status { get; set; }
}

public class UpdateFeaturedDto
{
    public bool IsFeatured { get; set; }
}

public class CreateCategoryDto
{
    public string Name { get; set; } = string.Empty;
    public string? Icon { get; set; }
}

public class UpdateCategoryDto
{
    public string? Name { get; set; }
    public string? Icon { get; set; }
    public bool? Status { get; set; }
}
