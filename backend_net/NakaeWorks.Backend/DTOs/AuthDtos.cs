using System.ComponentModel.DataAnnotations;

namespace NakaeWorks.Backend.DTOs;

public class LoginDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class RegisterDto
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;

    public string? Phone { get; set; }
    
    // Optional role for registration, default to consumer if not provided
    public string Role { get; set; } = "consumer";
}

public class SendOtpDto
{
    [Required]
    [Phone]
    public string Phone { get; set; } = string.Empty;
}

public class VerifyOtpDto
{
    [Required]
    [Phone]
    public string Phone { get; set; } = string.Empty;

    [Required]
    [StringLength(6, MinimumLength = 6)]
    public string Otp { get; set; } = string.Empty;

    // Optional: for new user registration via OTP
    public string? Name { get; set; }
}

