using System.Collections.Concurrent;

namespace NakaeWorks.Backend.Services;

public class OtpEntry
{
    public string Otp { get; set; } = "";
    public DateTime ExpiresAt { get; set; }
    public int Attempts { get; set; }
}

public class RateLimitEntry
{
    public int Count { get; set; }
    public DateTime WindowStart { get; set; }
}

public class SmsService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<SmsService> _logger;
    private readonly HttpClient _httpClient;
    
    // In-memory stores
    private static readonly ConcurrentDictionary<string, OtpEntry> _otpStore = new();
    private static readonly ConcurrentDictionary<string, RateLimitEntry> _rateLimitStore = new();

    // Config
    private const int OTP_EXPIRY_MINUTES = 5;
    private const int MAX_VERIFY_ATTEMPTS = 5;
    private const int MAX_OTP_REQUESTS_PER_HOUR = 5;
    private const int COOLDOWN_SECONDS = 30;
    private static readonly ConcurrentDictionary<string, DateTime> _lastSentStore = new();

    public SmsService(IConfiguration configuration, ILogger<SmsService> logger, IHttpClientFactory httpClientFactory)
    {
        _configuration = configuration;
        _logger = logger;
        _httpClient = httpClientFactory.CreateClient();
    }

    public string GenerateOtp()
    {
        var random = new Random();
        return random.Next(100000, 999999).ToString();
    }

    /// <summary>
    /// Check if phone can request OTP (rate limiting)
    /// </summary>
    public (bool allowed, string reason, int waitSeconds) CanSendOtp(string phone)
    {
        // Check cooldown (30 seconds between OTPs)
        if (_lastSentStore.TryGetValue(phone, out var lastSent))
        {
            var elapsed = (DateTime.UtcNow - lastSent).TotalSeconds;
            if (elapsed < COOLDOWN_SECONDS)
            {
                var wait = (int)Math.Ceiling(COOLDOWN_SECONDS - elapsed);
                return (false, $"Please wait {wait} seconds before requesting another OTP", wait);
            }
        }

        // Check hourly rate limit
        if (_rateLimitStore.TryGetValue(phone, out var rateLimit))
        {
            if (DateTime.UtcNow - rateLimit.WindowStart < TimeSpan.FromHours(1))
            {
                if (rateLimit.Count >= MAX_OTP_REQUESTS_PER_HOUR)
                {
                    var waitMinutes = (int)Math.Ceiling((rateLimit.WindowStart.AddHours(1) - DateTime.UtcNow).TotalMinutes);
                    return (false, $"Too many OTP requests. Please try again after {waitMinutes} minutes", waitMinutes * 60);
                }
            }
            else
            {
                // Reset window
                rateLimit.Count = 0;
                rateLimit.WindowStart = DateTime.UtcNow;
            }
        }

        return (true, "", 0);
    }

    public void StoreOtp(string phone, string otp)
    {
        var entry = new OtpEntry
        {
            Otp = otp,
            ExpiresAt = DateTime.UtcNow.AddMinutes(OTP_EXPIRY_MINUTES),
            Attempts = 0
        };
        _otpStore.AddOrUpdate(phone, entry, (_, __) => entry);

        // Update rate limit counter
        _rateLimitStore.AddOrUpdate(phone,
            new RateLimitEntry { Count = 1, WindowStart = DateTime.UtcNow },
            (_, existing) =>
            {
                if (DateTime.UtcNow - existing.WindowStart >= TimeSpan.FromHours(1))
                {
                    existing.Count = 1;
                    existing.WindowStart = DateTime.UtcNow;
                }
                else
                {
                    existing.Count++;
                }
                return existing;
            });

        // Update last sent time
        _lastSentStore.AddOrUpdate(phone, DateTime.UtcNow, (_, __) => DateTime.UtcNow);
    }

    public (bool success, string message) VerifyOtp(string phone, string otp)
    {
        if (!_otpStore.TryGetValue(phone, out var entry))
            return (false, "No OTP found. Please request a new one.");

        // Check expiry
        if (DateTime.UtcNow > entry.ExpiresAt)
        {
            _otpStore.TryRemove(phone, out _);
            return (false, "OTP has expired. Please request a new one.");
        }

        // Check max attempts
        entry.Attempts++;
        if (entry.Attempts > MAX_VERIFY_ATTEMPTS)
        {
            _otpStore.TryRemove(phone, out _);
            return (false, "Too many incorrect attempts. Please request a new OTP.");
        }

        if (entry.Otp != otp)
            return (false, $"Invalid OTP. {MAX_VERIFY_ATTEMPTS - entry.Attempts} attempts remaining.");

        // OTP verified, remove it
        _otpStore.TryRemove(phone, out _);
        return (true, "OTP verified successfully");
    }

    public async Task<bool> SendOtpSms(string phone, string otp)
    {
        try
        {
            var cleanPhone = phone.Replace("+91", "").Replace(" ", "").Replace("-", "").Trim();
            if (cleanPhone.Length > 10) cleanPhone = cleanPhone[^10..];

            var username = "Starnext";
            var apiKey = "EB98B-9C93C";
            var senderId = "ROHIAL";
            var templateId = "1507165087189012738";
            var route = "DND";
            
            var message = $"{otp} is your OTP, Please enter this code to confirm your Registration. : SMS Sent Via ROHAIL";
            
            var url = $"https://sms.infrainfotech.com/sms-panel/api/http/index.php?" +
                      $"username={Uri.EscapeDataString(username)}" +
                      $"&apikey={Uri.EscapeDataString(apiKey)}" +
                      $"&apirequest=Text" +
                      $"&sender={Uri.EscapeDataString(senderId)}" +
                      $"&mobile={Uri.EscapeDataString(cleanPhone)}" +
                      $"&message={Uri.EscapeDataString(message)}" +
                      $"&route={Uri.EscapeDataString(route)}" +
                      $"&TemplateID={Uri.EscapeDataString(templateId)}" +
                      $"&format=JSON";

            _logger.LogInformation("Sending OTP SMS to {Phone}", cleanPhone);
            
            var response = await _httpClient.GetAsync(url);
            var responseBody = await response.Content.ReadAsStringAsync();
            
            _logger.LogInformation("SMS API Response: {Response}", responseBody);

            // Check for success in response
            if (responseBody.Contains("success", StringComparison.OrdinalIgnoreCase))
                return true;

            _logger.LogWarning("SMS API returned non-success: {Response}", responseBody);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send OTP SMS to {Phone}", phone);
            return false;
        }
    }

    /// <summary>
    /// Clean phone number to 10-digit format
    /// </summary>
    public static string CleanPhone(string phone)
    {
        var clean = phone.Replace("+91", "").Replace(" ", "").Replace("-", "").Replace("(", "").Replace(")", "").Trim();
        if (clean.Length > 10) clean = clean[^10..];
        return clean;
    }
}
