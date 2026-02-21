using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NakaeWorks.Backend.Data;
using NakaeWorks.Backend.DTOs;
using NakaeWorks.Backend.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AppUser = NakaeWorks.Backend.Models.User; // Alias to avoid conflict with ControllerBase.User

namespace NakaeWorks.Backend.Controllers;

[Route("api/auth")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

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
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        
        var wallet = new Wallet { UserId = user.Id };
        _context.Wallets.Add(wallet);
        await _context.SaveChangesAsync();

        var token = GenerateToken(user);

        return StatusCode(201, new 
        { 
            message = "User registered successfully",
            token,
            user = new 
            {
                id = user.Id,
                name = user.Name,
                email = user.Email,
                role = user.Role
            }
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

        return Ok(new 
        { 
            message = "Login successful",
            token,
            user = new 
            {
                id = user.Id,
                name = user.Name,
                email = user.Email,
                role = user.Role,
                avatar = user.Avatar
            }
        });
    }

    private string GenerateToken(AppUser user)
    {
        var jwtKey = _configuration["Jwt:Key"];
        // Ensure Key is not null or throw friendly error handled by global exception handler usually, but here:
        if (string.IsNullOrEmpty(jwtKey)) throw new Exception("JWT Key not configured");

        var key = Encoding.ASCII.GetBytes(jwtKey);
        
        var claims = new List<Claim>
        {
            new Claim("id", user.Id.ToString()),
            new Claim("role", user.Role),
            new Claim(JwtRegisteredClaimNames.Email, user.Email)
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
    
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userIdString = HttpContext.User.FindFirst("id")?.Value;
        if (string.IsNullOrEmpty(userIdString) || !long.TryParse(userIdString, out var userId))
        {
            return Unauthorized();
        }
        
        var user = await _context.Users
            .Include(u => u.Addresses)
            .FirstOrDefaultAsync(u => u.Id == userId);
            
        if (user == null) return NotFound();
        
        return Ok(user);
    }

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
        
        // Decode token manually
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
