using System.ComponentModel.DataAnnotations;

namespace API.DTO;

public class RoleChangeDTO
{
    [Required(ErrorMessage = "Rol zorunludur.")]
    [MaxLength(20)]
    public string Role { get; set; } = null!;

    [Required(ErrorMessage = "Şifre zorunludur.")]
    [MaxLength(100)]
    public string Password { get; set; } = null!;
}