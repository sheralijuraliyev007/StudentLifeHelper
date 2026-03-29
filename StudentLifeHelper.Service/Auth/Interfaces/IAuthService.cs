


using StatusGeneric;
using StudentLifeHelper.Common.Dtos.Auth;
using StudentLifeHelper.Common.Dtos.User;
using StudentLifeHelper.Common.Models.Auth;

namespace StudentLifeHelper.Service.Auth.Interfaces
{
    public interface IAuthService : IStatusGeneric
    {
        Task<TokenDto?> RegisterAsync(RegisterModel registerModel); 
        Task<TokenDto?> LoginAsy(LoginModel loginModel); 
        Task<UserDto?> GetProfile(); 
    }
}
