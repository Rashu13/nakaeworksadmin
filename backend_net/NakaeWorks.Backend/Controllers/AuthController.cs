using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NakaeWorks.Backend.Data;
using NakaeWorks.Backend.DTOs;
using NakaeWorks.Backend.Models;
using NakaeWorks.Backend.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AppUser = NakaeWorks.Backend.Models.User;

namespace NakaeWorks.Backend.Controllers;

[Route("api/auth")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly SmsService _smsService;

    public AuthController(ApplicationDbContext context, IConfiguration configuration, SmsService smsService)
    {
        _context = context;
        _configuration = configuration;
        _smsService = smsService;
    }

    // ==========================================
    // EMAIL/PASSWORD AUTH
    // ==========================================

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
        {
            return BadRequest(new { message = "Email already exists" });
        }

        var user = new AppUser
        {
            Name = dto.Name,
            Email = dto.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Phone = dto.Phone,
            Role = dto.Role,
            Status = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        
        var wallet = new Wallet { UserId = user.Id };
        _context.Wallets.Add(wallet);
        await _context.SaveChangesAsync();

        var token = GenerateToken(user);
        var refreshToken = GenerateRefreshToken();

        return StatusCode(201, new 
        { 
            message = "User registered successfully",
            token,
            refreshToken,
            expiresIn = 7 * 24 * 60 * 60, // 7 days in seconds
            user = MapUserResponse(user)
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user == null)
        {
            return BadRequest(new { message = "Invalid email or password" });
        }

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.Password))
        {
             return BadRequest(new { message = "Invalid email or password" });
        }

        if (!user.Status)
        {
            return BadRequest(new { message = "Your account has been suspended." });
        }

        var token = GenerateToken(user);
        var refreshToken = GenerateRefreshToken();

        return Ok(new 
        { 
            message = "Login successful",
            token,
            refreshToken,
            expiresIn = 7 * 24 * 60 * 60,
            user = MapUserResponse(user)
        });
    }

    // ==========================================
    // OTP AUTH
    // ==========================================

    [HttpPost("send-otp")]
    public async Task<IActionResult> SendOtp([FromBody] SendOtpDto dto)
    {
        var cleanPhone = SmsService.CleanPhone(dto.Phone);

        if (cleanPhone.Length != 10 || !cleanPhone.All(char.IsDigit))
            return BadRequest(new { message = "Please enter a valid 10-digit phone number" });

        // Rate limiting check
        var (allowed, reason, waitSeconds) = _smsService.CanSendOtp(cleanPhone);
        if (!allowed)
            return StatusCode(429, new { message = reason, waitSeconds });

        var otp = _smsService.GenerateOtp();
        _smsService.StoreOtp(cleanPhone, otp);

        var sent = await _smsService.SendOtpSms(cleanPhone, otp);
        if (!sent)
            return StatusCode(500, new { message = "Failed to send OTP. Please try again later." });

        // Check if user exists
        var userExists = await _context.Users.AnyAsync(u => u.Phone == cleanPhone);

        return Ok(new { 
            message = "OTP sent successfully",
            isExistingUser = userExists,
            expiresIn = 300 // 5 minutes
        });
    }

    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDto dto)
    {
        var cleanPhone = SmsService.CleanPhone(dto.Phone);

        if (cleanPhone.Length != 10 || !cleanPhone.All(char.IsDigit))
            return BadRequest(new { message = "Please enter a valid 10-digit phone number" });

        var (success, verifyMessage) = _smsService.VerifyOtp(cleanPhone, dto.Otp);
        if (!success)
            return BadRequest(new { message = verifyMessage });

        // Find user by phone
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Phone == cleanPhone);

        if (user == null)
        {
            // Auto-register new user
            var userName = !string.IsNullOrWhiteSpace(dto.Name) ? dto.Name.Trim() : $"User {cleanPhone[^4..]}";

            user = new AppUser
            {
                Name = userName,
                Email = $"{cleanPhone}@phone.nakaeworks.com",
                Password = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()),
                Phone = cleanPhone,
                Role = "consumer",
                Status = true,
                IsVerified = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Create wallet for new user
            var wallet = new Wallet { UserId = user.Id };
            _context.Wallets.Add(wallet);
            await _context.SaveChangesAsync();
        }

        if (!user.Status)
            return BadRequest(new { message = "Your account has been suspended." });

        // Mark phone as verified
        if (!user.IsVerified)
        {
            user.IsVerified = true;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        var token = GenerateToken(user);
        var refreshToken = GenerateRefreshToken();

        return Ok(new
        {
            message = "Login successful",
            token,
            refreshToken,
            expiresIn = 7 * 24 * 60 * 60,
            user = MapUserResponse(user)
        });
    }

    // ==========================================
    // SESSION MANAGEMENT
    // ==========================================

    [Authorize]
    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken()
    {
        var userIdString = HttpContext.User.FindFirst("id")?.Value;
        if (string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out var userId))
            return Unauthorized(new { message = "Invalid session" });

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return Unauthorized(new { message = "User not found" });

        if (!user.Status)
            return BadRequest(new { message = "Your account has been suspended." });

        var token = GenerateToken(user);
        var refreshToken = GenerateRefreshToken();

        return Ok(new
        {
            token,
            refreshToken,
            expiresIn = 7 * 24 * 60 * 60,
            user = MapUserResponse(user)
        });
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userIdString = HttpContext.User.FindFirst("id")?.Value;
        if (string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out var userId))
        {
            return Unauthorized(new { message = "Not authenticated" });
        }
        
        var user = await _context.Users
            .Include(u => u.Addresses)
            .FirstOrDefaultAsync(u => u.Id == userId);
            
        if (user == null) return NotFound(new { message = "User not found" });
        
        return Ok(user);
    }

    [Authorize]
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userIdString = HttpContext.User.FindFirst("id")?.Value;
        if (string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out var userId))
            return Unauthorized(new { message = "Not authenticated" });

        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound(new { message = "User not found" });

        return Ok(MapUserResponse(user));
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] Dictionary<string, object> updates)
    {
        var userIdString = HttpContext.User.FindFirst("id")?.Value;
        if (string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out var userId))
            return Unauthorized(new { message = "Not authenticated" });

        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound(new { message = "User not found" });

        if (updates.ContainsKey("name") && updates["name"] != null)
            user.Name = updates["name"].ToString()!;
        if (updates.ContainsKey("phone") && updates["phone"] != null)
            user.Phone = updates["phone"].ToString();
        if (updates.ContainsKey("about") && updates["about"] != null)
            user.About = updates["about"].ToString();
        if (updates.ContainsKey("avatar") && updates["avatar"] != null)
            user.Avatar = updates["avatar"].ToString();

        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Profile updated", data = MapUserResponse(user) });
    }

    [Authorize]
    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] Dictionary<string, string> passwordData)
    {
        var userIdString = HttpContext.User.FindFirst("id")?.Value;
        if (string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out var userId))
            return Unauthorized(new { message = "Not authenticated" });

        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound(new { message = "User not found" });

        if (!passwordData.ContainsKey("currentPassword") || !passwordData.ContainsKey("newPassword"))
            return BadRequest(new { message = "Current password and new password are required" });

        if (!BCrypt.Net.BCrypt.Verify(passwordData["currentPassword"], user.Password))
            return BadRequest(new { message = "Current password is incorrect" });

        if (passwordData["newPassword"].Length < 6)
            return BadRequest(new { message = "New password must be at least 6 characters" });

        user.Password = BCrypt.Net.BCrypt.HashPassword(passwordData["newPassword"]);
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Password changed successfully" });
    }

    [Authorize]
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        // JWT is stateless, but frontend will clear tokens
        return Ok(new { message = "Logged out successfully" });
    }

    // ==========================================
    // HELPERS
    // ==========================================

    private string GenerateToken(AppUser user)
    {
        var jwtKey = _configuration["Jwt:Key"];
        if (string.IsNullOrEmpty(jwtKey)) throw new Exception("JWT Key not configured");

        var key = Encoding.ASCII.GetBytes(jwtKey);
        
        var claims = new List<Claim>
        {
            new Claim("id", user.Id.ToString()),
            new Claim("role", user.Role),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim("phone", user.Phone ?? ""),
            new Claim("name", user.Name ?? ""),
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    private static string GenerateRefreshToken()
    {
        var randomBytes = new byte[32];
        using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }

    private static object MapUserResponse(AppUser user) => new
    {
        id = user.Id,
        name = user.Name,
        email = user.Email,
        phone = user.Phone,
        role = user.Role,
        avatar = user.Avatar,
        about = user.About,
        served = user.Served,
        isVerified = user.IsVerified
    };

    [AllowAnonymous]
    [HttpGet("debug-claims")]
    public IActionResult DebugClaims()
    {
        var authHeader = HttpContext.Request.Headers["Authorization"].FirstOrDefault();
        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
        {
            return Ok(new { message = "No Bearer token found", isAuthenticated = User.Identity?.IsAuthenticated });
        }

        var token = authHeader.Substring("Bearer ".Length);
        
        var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
        try
        {
            var jwtToken = handler.ReadJwtToken(token);
            var claims = jwtToken.Claims.Select(c => new { c.Type, c.Value }).ToList();
            
            return Ok(new
            {
                isAuthenticated = User.Identity?.IsAuthenticated,
                authenticationType = User.Identity?.AuthenticationType,
                identityName = User.Identity?.Name,
                userClaims = User.Claims.Select(c => new { c.Type, c.Value }).ToList(),
                tokenClaims = claims,
                tokenExpires = jwtToken.ValidTo,
                tokenIssued = jwtToken.IssuedAt
            });
        }
        catch (Exception ex)
        {
            return Ok(new { error = ex.Message });
        }
    }
}
