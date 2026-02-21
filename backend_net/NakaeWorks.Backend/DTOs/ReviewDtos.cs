namespace NakaeWorks.Backend.DTOs;

public class CreateReviewDto
{
    public long BookingId { get; set; }
    public long ServiceId { get; set; }
    public long ProviderId { get; set; }
    public decimal Rating { get; set; }
    public string? Comment { get; set; }
}

public class ReviewDto
{
    public long Id { get; set; }
    public long BookingId { get; set; }
    public long ServiceId { get; set; }
    public string ServiceName { get; set; } = string.Empty;
    public long ConsumerId { get; set; }
    public string ConsumerName { get; set; } = string.Empty;
    public string? ConsumerAvatar { get; set; }
    public long ProviderId { get; set; }
    public decimal Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ReviewResponseDto
{
    public long Id { get; set; }
    public long BookingId { get; set; }
    public long ServiceId { get; set; }
    public string ServiceName { get; set; } = string.Empty;
    public long ConsumerId { get; set; }
    public string ConsumerName { get; set; } = string.Empty;
    public string? ConsumerAvatar { get; set; }
    public long ProviderId { get; set; }
    public decimal Rating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
}
