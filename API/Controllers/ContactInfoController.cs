using API.Data;
using API.DTO;
using API.Entity;
using API.Filters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/contact-info")]
public class ContactInfoController : ControllerBase
{
    private const int SingletonId = 1;
    private const int MaxAddressLines = 3;
    private const int MaxWorkingHourLines = 6;

    private readonly DataContext _context;

    public ContactInfoController(DataContext context)
    {
        _context = context;
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var info = await _context.ContactInfo.AsNoTracking().FirstOrDefaultAsync(x => x.Id == SingletonId);

        return Ok(info == null
            ? new ContactInfoDTO { Email = "", Address = "", WorkingHours = "" }
            : ToDTO(info));
    }

    [HttpPut]
    [DemoDisabled]
    public async Task<IActionResult> Update(ContactInfoDTO dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var email = dto.Email.Trim();
        var address = NormalizeLines(dto.Address);
        var workingHours = NormalizeLines(dto.WorkingHours);

        if (address.Length == 0 || workingHours.Length == 0)
            return BadRequest(new { message = "Adres ve çalışma saatleri boş olamaz." });

        if (address.Split('\n').Length > MaxAddressLines)
            return BadRequest(new { message = $"Adres en fazla {MaxAddressLines} satır olabilir." });

        if (workingHours.Split('\n').Length > MaxWorkingHourLines)
            return BadRequest(new { message = $"Çalışma saatleri en fazla {MaxWorkingHourLines} satır olabilir." });

        var info = await _context.ContactInfo.FirstOrDefaultAsync(x => x.Id == SingletonId);
        if (info == null)
        {
            info = new StoreContactInfo { Id = SingletonId };
            _context.ContactInfo.Add(info);
        }

        info.Email = email;
        info.Address = address;
        info.WorkingHours = workingHours;
        info.UpdatedAt = DateTime.Now;

        await _context.SaveChangesAsync();

        return Ok(ToDTO(info));
    }

    private static ContactInfoDTO ToDTO(StoreContactInfo info) => new()
    {
        Email = info.Email,
        Address = info.Address,
        WorkingHours = info.WorkingHours
    };

    private static string NormalizeLines(string value) =>
        string.Join('\n', value
            .Replace("\r\n", "\n")
            .Split('\n')
            .Select(line => line.Trim())
            .Where(line => line.Length > 0));
}