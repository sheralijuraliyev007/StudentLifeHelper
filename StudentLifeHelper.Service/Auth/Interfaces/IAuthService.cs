namespace StudentLifeHelper.Service.Auth.Interfaces
{
    public interface IAuthService : IStatusGeneric
    {
        Task<UserDto?> RegisterAsync(RegisterModel registerModel); 
        Task<TokenDto?> LoginAsync(LoginModel loginModel); 
        Task<UserDto?> GetProfile();

        Task<TokenDto?> RefreshTokenAsync(TokenDto tokenDto);

        Task<string?> UpdateProfileAsync(UpdateUserModel updateProfileModel);

        Task<string?> UpdateUsernameAsync(string newUsername);


        Task<string?> UpdateUserImage( IFormFile img);
    }
}
