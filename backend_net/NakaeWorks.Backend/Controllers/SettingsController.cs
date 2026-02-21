using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NakaeWorks.Backend.Data;
using NakaeWorks.Backend.Models;

namespace NakaeWorks.Backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class SettingsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SettingsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/Settings
    [HttpGet]
    public async Task<ActionResult<IEnumerable<SystemSetting>>> GetSettings()
    {
        return await _context.SystemSettings.ToListAsync();
    }

    // PUT: api/Settings/{key}
    [HttpPut("{key}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateSetting(string key, [FromBody] SystemSetting setting)
    {
        if (key != setting.Key)
        {
            return BadRequest();
        }

        var existingSetting = await _context.SystemSettings.FirstOrDefaultAsync(s => s.Key == key);
        if (existingSetting == null)
        {
            return NotFound();
        }

        existingSetting.Value = setting.Value;
        existingSetting.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!SettingExists(key))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    private bool SettingExists(string key)
    {
        return _context.SystemSettings.Any(e => e.Key == key);
    }
}
