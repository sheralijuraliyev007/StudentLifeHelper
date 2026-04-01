


using StatusGeneric;
using StudentLifeHelper.Common.Dtos.Auth;
using StudentLifeHelper.Common.Dtos.User;
using StudentLifeHelper.Common.Models.Auth;

namespace StudentLifeHelper.Service.Auth.Interfaces
{
    public interface IAuthService : IStatusGeneric
    {
        Task<UserDto?> RegisterAsync(RegisterModel registerModel); 
        Task<TokenDto?> LoginAsync(LoginModel loginModel); 
        Task<UserDto?> GetProfile();

        Task<TokenDto?> RefreshTokenAsync(TokenDto tokenDto);
    }
}
