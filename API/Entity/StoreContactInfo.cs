namespace API.Entity;

public class StoreContactInfo
{
    public int Id { get; set; }
    public string Email { get; set; } = null!;
    public string Address { get; set; } = null!;
    public string WorkingHours { get; set; } = null!;
    public DateTime UpdatedAt { get; set; }
}