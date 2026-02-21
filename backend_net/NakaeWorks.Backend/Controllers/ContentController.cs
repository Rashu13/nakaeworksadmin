using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NakaeWorks.Backend.Data;
using NakaeWorks.Backend.Models;

namespace NakaeWorks.Backend.Controllers;

[Route("api/content")]
[ApiController]
public class ContentController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ContentController(ApplicationDbContext context)
    {
        _context = context;
    }

    // Public API for Home Page
    [HttpGet("home")]
    public async Task<IActionResult> GetHomeContent()
    {
        var banners = await _context.Banners
            .Where(b => b.IsActive)
            .OrderBy(b => b.Position)
            .ToListAsync();

        var collections = await _context.Collections
            .Where(c => c.IsActive)
            .OrderBy(c => c.Position)
            .Include(c => c.Items)
                .ThenInclude(ci => ci.Service)
                    .ThenInclude(s => s.Provider) // Include Provider for service details
            .ToListAsync();

        // Transform collections to include actual service data
        var resultCollections = new List<object>();

        foreach (var col in collections)
        {
            var services = new List<Service>();
            
            if (col.Type == "manual")
            {
                services = col.Items.OrderBy(i => i.Position).Select(i => i.Service).ToList();
            }
            else if (col.Type == "auto-new")
            {
                services = await _context.Services
                    .Include(s => s.Provider)
                    .OrderByDescending(s => s.CreatedAt)
                    .Take(10)
                    .ToListAsync();
            }
            else if (col.Type == "auto-featured")
            {
                services = await _context.Services
                    .Include(s => s.Provider)
                    .Where(s => s.IsFeatured)
                    .Take(10)
                    .ToListAsync();
            }

            resultCollections.Add(new
            {
                col.Id,
                col.Title,
                col.Type,
                Services = services.Select(s => new
                {
                    s.Id,
                    s.Name,
                    s.Thumbnail,
                    s.Price,
                    s.Discount,
                    s.Rating,
                    s.ReviewCount,
                    Provider = new { Name = s.Provider?.Name, Avatar = s.Provider?.Avatar }
                })
            });
        }

        return Ok(new
        {
            Banners = banners,
            Collections = resultCollections
        });
    }

    // Admin APIs

    // BANNERS
    [HttpGet("banners")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetBanners()
    {
        return Ok(await _context.Banners.OrderBy(b => b.Position).ToListAsync());
    }

    [HttpPost("banners")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> CreateBanner([FromBody] Banner banner)
    {
        banner.CreatedAt = DateTime.UtcNow;
        banner.UpdatedAt = DateTime.UtcNow;
        _context.Banners.Add(banner);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetBanners), new { id = banner.Id }, banner);
    }

    [HttpPut("banners/{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateBanner(int id, [FromBody] Banner banner)
    {
        if (id != banner.Id) return BadRequest();
        var existing = await _context.Banners.FindAsync(id);
        if (existing == null) return NotFound();

        existing.Title = banner.Title;
        existing.ImageUrl = banner.ImageUrl;
        existing.Link = banner.Link;
        existing.Position = banner.Position;
        existing.IsActive = banner.IsActive;
        existing.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("banners/{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteBanner(int id)
    {
        var banner = await _context.Banners.FindAsync(id);
        if (banner == null) return NotFound();
        _context.Banners.Remove(banner);
        await _context.SaveChangesAsync();
        return Ok();
    }

    // COLLECTIONS
    [HttpGet("collections")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetCollections()
    {
        return Ok(await _context.Collections.Include(c => c.Items).OrderBy(c => c.Position).ToListAsync());
    }

    [HttpPost("collections")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> CreateCollection([FromBody] Collection collection)
    {
        collection.CreatedAt = DateTime.UtcNow;
        collection.UpdatedAt = DateTime.UtcNow;
        _context.Collections.Add(collection);
        await _context.SaveChangesAsync();
        
        // Handle Items if any (simple implementation)
        if (collection.Items != null && collection.Items.Any())
        {
            foreach(var item in collection.Items)
            {
                item.CollectionId = collection.Id;
                _context.CollectionItems.Add(item);
            }
            await _context.SaveChangesAsync();
        }

        return CreatedAtAction(nameof(GetCollections), new { id = collection.Id }, collection);
    }

    [HttpPut("collections/{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateCollection(int id, [FromBody] CollectionDto dto) // Using DTO here to simplify
    {
        var existing = await _context.Collections.Include(c => c.Items).FirstOrDefaultAsync(c => c.Id == id);
        if (existing == null) return NotFound();

        existing.Title = dto.Title;
        existing.Type = dto.Type;
        existing.Position = dto.Position;
        existing.IsActive = dto.IsActive;
        existing.UpdatedAt = DateTime.UtcNow;

        // Sync Items
        _context.CollectionItems.RemoveRange(existing.Items);
        if (dto.ServiceIds != null)
        {
            foreach (var serviceId in dto.ServiceIds)
            {
                _context.CollectionItems.Add(new CollectionItem
                {
                    CollectionId = id,
                    ServiceId = serviceId
                });
            }
        }

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("collections/{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> DeleteCollection(int id)
    {
        var collection = await _context.Collections.FindAsync(id);
        if (collection == null) return NotFound();
        _context.Collections.Remove(collection);
        await _context.SaveChangesAsync();
        return Ok();
    }
}

public class CollectionDto
{
    public required string Title { get; set; }
    public required string Type { get; set; }
    public int Position { get; set; }
    public bool IsActive { get; set; }
    public List<long>? ServiceIds { get; set; }
}
