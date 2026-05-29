using System.ComponentModel.DataAnnotations;


namespace StudentLifeHelper.Common.Models.Auth
{
    public class LoginModel
    {
        [Required(ErrorMessage = "Username kiritilishi shart")]
        [StringLength(32, ErrorMessage = "Username maksimal 50 ta belgidan iborat bo'lishi mumkin va ")]
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        

        
    }
}
