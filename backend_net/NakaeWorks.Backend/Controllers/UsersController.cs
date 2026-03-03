using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NakaeWorks.Backend.Data;
using System.Security.Claims;

namespace NakaeWorks.Backend.Controllers;

[Route("api/users")]
[ApiController]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IWebHostEnvironment _env;

    public UsersController(ApplicationDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    [HttpPost("update-profile")]
    public async Task<IActionResult> UpdateProfile([FromForm] string? name, [FromForm] string? phone, [FromForm] string? email, IFormFile? picture)
    {
        var userIdStr = User.FindFirst("id")?.Value;
        if (string.IsNullOrEmpty(userIdStr) || !long.TryParse(userIdStr, out var userId))
            return Unauthorized(new { message = "Not authenticated" });

        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound(new { message = "User not found" });

        // Update fields
        if (!string.IsNullOrEmpty(name)) user.Name = name;
        if (!string.IsNullOrEmpty(phone)) user.Phone = phone;
        if (!string.IsNullOrEmpty(email)) user.Email = email;

        // Handle picture upload
        if (picture != null && picture.Length > 0)
        {
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var extension = Path.GetExtension(picture.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest(new { message = "Invalid file type. Allowed: jpg, jpeg, png, gif, webp" });
            }

            var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var uploadsFolder = Path.Combine(webRoot, "uploads");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var fileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await picture.CopyToAsync(stream);
            }

            user.Avatar = $"{Request.Scheme}://{Request.Host}/uploads/{fileName}";
        }

        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Profile updated successfully",
            user = new
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
            }
        });
    }
}
