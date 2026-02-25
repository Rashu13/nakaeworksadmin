using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NakaeWorks.Backend.Data;
using NakaeWorks.Backend.DTOs;
using NakaeWorks.Backend.Models;
using System.Security.Claims;

namespace NakaeWorks.Backend.Controllers;

[Route("api/addresses")]
[ApiController]
[Authorize]
public class AddressesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AddressesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetUserAddresses()
    {
        var userIdStr = User.FindFirst("id")?.Value;
        if (userIdStr == null) return Unauthorized();
        long userId = long.Parse(userIdStr);

        var addresses = await _context.Addresses
            .Where(a => a.UserId == userId)
            .Select(a => new AddressDto
            {
                Id = a.Id,
                AddressLine1 = a.AddressLine,
                City = a.City,
                State = a.State,
                Pincode = a.Pincode,
                Country = a.Country,
                Type = a.Type,
                IsPrimary = a.IsPrimary
            })
            .ToListAsync();

        return Ok(addresses);
    }

    [HttpPost]
    public async Task<IActionResult> AddAddress([FromBody] CreateAddressDto dto)
    {
        var userIdStr = User.FindFirst("id")?.Value;
        if (userIdStr == null) return Unauthorized();
        long userId = long.Parse(userIdStr);

        var address = new Address
        {
            UserId = userId,
            AddressLine = dto.AddressLine1,
            City = dto.City,
            State = dto.State,
            Pincode = dto.Pincode,
            Country = dto.Country,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            Type = dto.Type,
            IsPrimary = dto.IsPrimary,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        if (dto.IsPrimary)
        {
            // Reset other primary addresses
            var primaries = await _context.Addresses
                .Where(a => a.UserId == userId && a.IsPrimary)
                .ToListAsync();
            
            foreach (var p in primaries)
            {
                p.IsPrimary = false;
            }
        }

        _context.Addresses.Add(address);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetUserAddresses), new { id = address.Id }, new { message = "Address added", addressId = address.Id });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAddress(long id, [FromBody] CreateAddressDto dto)
    {
        var userIdStr = User.FindFirst("id")?.Value;
        if (userIdStr == null) return Unauthorized();
        long userId = long.Parse(userIdStr);

        var address = await _context.Addresses.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);
        if (address == null) return NotFound();

        address.AddressLine = dto.AddressLine1;
        address.City = dto.City;
        address.State = dto.State;
        address.Pincode = dto.Pincode;
        address.Country = dto.Country;
        address.Latitude = dto.Latitude;
        address.Longitude = dto.Longitude;
        address.Type = dto.Type;
        address.IsPrimary = dto.IsPrimary;
        address.UpdatedAt = DateTime.UtcNow;

        if (dto.IsPrimary)
        {
            // Reset other primary addresses
            var primaries = await _context.Addresses
                .Where(a => a.UserId == userId && a.IsPrimary && a.Id != id)
                .ToListAsync();

            foreach (var p in primaries)
            {
                p.IsPrimary = false;
            }
        }

        await _context.SaveChangesAsync();

        return Ok(new { message = "Address updated" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAddress(long id)
    {
        var userIdStr = User.FindFirst("id")?.Value;
        if (userIdStr == null) return Unauthorized();
        long userId = long.Parse(userIdStr);

        var address = await _context.Addresses.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);
        if (address == null) return NotFound();

        _context.Addresses.Remove(address);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Address deleted" });
    }
}
