using System.ComponentModel.DataAnnotations;

namespace API.DTO;

public class RegisterDTO
{
    [Required]
    [Display(Name = "Ad Soyad")]
    public string AdSoyad { get; set; } = null!;

    [Required]
    [Display(Name = "Kullanıcı Adı")]
    public string UserName { get; set; } = null!;

    [Required]
    [EmailAddress]
    [Display(Name = "E-posta")]
    public string Email { get; set; } = null!;

    [Required]
    [MinLength(6)]
    [Display(Name = "Parola")]
    public string Password { get; set; } = null!;

    [Required]
    [Compare("Password", ErrorMessage = "Parolalar eşleşmiyor.")]
    [Display(Name = "Parola Tekrar")]
    public string ConfirmPassword { get; set; } = string.Empty;
}