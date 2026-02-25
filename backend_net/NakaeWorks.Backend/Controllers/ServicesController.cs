using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NakaeWorks.Backend.Data;
using NakaeWorks.Backend.DTOs;
using NakaeWorks.Backend.Models;

namespace NakaeWorks.Backend.Controllers;

[Route("api/services")]
[ApiController]
public class ServicesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ServicesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllServices([FromQuery] long? categoryId, [FromQuery] string? category, [FromQuery] string? search)
    {
        var query = _context.Services
            .Include(s => s.Category)
            .Include(s => s.Provider)
            .AsQueryable();

        if (categoryId.HasValue)
        {
            query = query.Where(s => s.CategoryId == categoryId.Value);
        }

        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(s => (s.Category != null && (s.Category.Name.ToLower() == category.ToLower() || s.Category.Slug.ToLower() == category.ToLower())));
        }

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(s => s.Name.Contains(search) || (s.Description != null && s.Description.Contains(search)));
        }

        var services = await query
            .Where(s => s.Status == true)
            .Select(s => new ServiceDto
            {
                Id = s.Id,
                Name = s.Name,
                Slug = s.Slug,
                Price = s.Price,
                Discount = s.Discount,
                Duration = s.Duration,
                Thumbnail = s.Thumbnail,
                Description = s.Description,
                IsFeatured = s.IsFeatured,
                CategoryId = s.CategoryId,
                CategoryName = s.Category != null ? s.Category.Name : "",
                CategorySlug = s.Category != null ? s.Category.Slug : "",
                ProviderId = s.ProviderId,
                ProviderName = s.Provider != null ? s.Provider.Name : "",
                ProviderAvatar = s.Provider != null ? s.Provider.Avatar : ""
            })
            .ToListAsync();

        return Ok(services);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetServiceById(long id)
    {
        var service = await _context.Services
            .Include(s => s.Category)
            .Include(s => s.Provider)
            .Where(s => s.Id == id)
            .Select(s => new ServiceDto
            {
                Id = s.Id,
                Name = s.Name,
                Slug = s.Slug,
                Price = s.Price,
                Discount = s.Discount,
                Duration = s.Duration,
                Thumbnail = s.Thumbnail,
                Description = s.Description,
                IsFeatured = s.IsFeatured,
                CategoryId = s.CategoryId,
                CategoryName = s.Category != null ? s.Category.Name : "",
                CategorySlug = s.Category != null ? s.Category.Slug : "",
                ProviderId = s.ProviderId,
                ProviderName = s.Provider != null ? s.Provider.Name : "",
                ProviderAvatar = s.Provider != null ? s.Provider.Avatar : ""
            })
            .FirstOrDefaultAsync();

        if (service == null) return NotFound();

        return Ok(service);
    }
    
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _context.Categories
            .Where(c => c.Status == true)
            .ToListAsync();

        var serviceCounts = await _context.Services
            .Where(s => s.Status == true)
            .GroupBy(s => s.CategoryId)
            .Select(g => new { CategoryId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(k => k.CategoryId, v => v.Count);

        var result = categories.Select(c => new CategoryDto 
        {
            Id = c.Id,
            Name = c.Name,
            Slug = c.Slug,
            Icon = c.Icon,
            ServicesCount = serviceCounts.ContainsKey(c.Id) ? serviceCounts[c.Id] : 0
        });
            
        return Ok(result);
    }
}
