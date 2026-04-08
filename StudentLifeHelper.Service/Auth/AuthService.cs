using Mapster;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Minio.Helper;
using StatusGeneric;
using StudentLifeHelper.Common.Constants;
using StudentLifeHelper.Common.Dtos.Auth;
using StudentLifeHelper.Common.Dtos.User;
using StudentLifeHelper.Common.Extensions;
using StudentLifeHelper.Common.Models.Auth;
using StudentLifeHelper.Data.Entities.MainEntities;
using StudentLifeHelper.Data.Repositories.Interfaces;
using StudentLifeHelper.Service.Auth.Interfaces;
using StudentLifeHelper.Service.Common.Interfaces;
using StudentLifeHelper.Service.Public.Content.Interfaces;


namespace StudentLifeHelper.Service.Auth
{
    public class AuthService(IUnitOfWork unitOfWork, IContentService contentService, JwtService jwtService, IUserHelper userHelper) :
        StatusGenericHandler, IAuthService
    {


        #region Login action
        public async Task<TokenDto?> LoginAsync(LoginModel loginModel)
        {
            await using var transaction = unitOfWork.BeginTransaction();

            try
            {
                var user = await GetUserByUsername(loginModel.Username);
                if (user is null)
                {
                    AddError("The user not found or username is incorrect.");
                    return null;
                }
                var vertificationResult = VerifyPassword(user!, loginModel.Password);

                if (vertificationResult == PasswordVerificationResult.Failed)
                {
                    AddError("Password is incorrect");
                    return null;
                }

                var tokenDto = jwtService.GenerateToken(user, true);

                await unitOfWork.UserRepository().Update(user);
                await unitOfWork.SaveChanges();
                await transaction.CommitAsync();

                return tokenDto;

            }
            catch
            {
                await transaction.RollbackAsync();
                return null;
            }
        }


        #endregion

        public async Task<UserDto?> GetProfile()
        {
            var userId = Guid.Parse(userHelper.GetUserId());

            var user = await (unitOfWork.UserRepository().GetAll(u => u.Role!, u => u.Img, u => u.BirthCountry!, u => u.ResidenceCountry!, u => u.Gender!, u => u.Region!, u=>u.State!))
                .FirstOrDefaultAsync(u => u.Id == userId);

            if(user is null)
            {
                AddError("User not found.");
                return null;
            }

            var config = new TypeAdapterConfig();
            config.NewConfig<User, UserDto>()
                .Map(dest => dest.Role, src => src.Role!.FullName)
                .Map(dest => dest.Region, src => src.Region!.FullName)
                .Map(dest => dest.Gender, src => src.Gender!.FullName)
                .Map(dest => dest.BirthCountry, src => src.BirthCountry!.FullName)
                .Map(dest => dest.State, src => src.State!.FullName)
                .Map(dest => dest.ResidenceCountry, src => src.ResidenceCountry!.FullName)
                .Map(dest => dest.ImgUrl, src => src.ImgId != null && src.Img != null
                    ? src.Img.FileId.GetFileUrl() : null);

            var userDto = user.MapToDto<User, UserDto>(config);

            return userDto;
        }

        public async Task<TokenDto?> RefreshTokenAsync(TokenDto tokenDto)
        {
            var (check, username) = jwtService.ValidateAndGetUser(tokenDto.AccessToken);
            if (!check)
            {
                AddError("Invalid access token.");
                return null;
            }

            var user = (unitOfWork.UserRepository().GetAll(u => u.Role!)
                .FirstOrDefault(u => u.Username == username && u.StateId == StateIdConstants.Active));

            bool isValid = user is null || user.RefreshToken != tokenDto.RefreshToken
                || user.RefreshTokenExpireTime <= DateTime.UtcNow;

            if (!isValid) { 
                AddError("Refresh token is invalid or expired.");
                return null;
            }
            var token = jwtService.GenerateToken(user!, false);

            return token;
        }

        public async Task<UserDto?> RegisterAsync(RegisterModel registerModel)
        {
            using var transaction = unitOfWork.BeginTransaction();
            try
            {
                //var existingUser = await GetUserByUsername(registerModel.Username);
                //if (existingUser != null) { 
                //    AddError("Username is already taken.");
                //    return null;
                //}

                var existingUser = await UserNameExists(registerModel.Username);
                if (existingUser)
                {
                    AddError("Username is already taken.");
                    return null;
                }

                var contentId = await contentService.CreateContentForImage(registerModel.ImageFile, "profile");
                var userId = Guid.NewGuid();
                await unitOfWork.ContentRepository().GetAll().Where(c => c.Id == contentId).ExecuteUpdateAsync(c => c.SetProperty(x => x.CreatedUserId, userId));
                var newUser = new User
                {
                    Id = userId,
                    FirstName = registerModel.FirstName,
                    LastName = registerModel.LastName,
                    MiddleName = registerModel.MiddleName,
                    BirthDate = registerModel.BirthDate,
                    Username = registerModel.Username,
                    BirthCountryId = registerModel.BirthCountryId,
                    ResidenceCountryId = registerModel.ResidenceCountryId,
                    ImgId = contentId,
                    StateId = StateIdConstants.Active,
                    GenderId = registerModel.GenderId,
                    RegionId = registerModel.RegionId,
                    RoleId = RoleConstants.UserRoleId,
                    RefreshTokenExpireTime = DateTime.UtcNow.AddHours(1),
                    CreatedUserId = userId
                };
                newUser.PasswordHash = HashPasword(newUser, registerModel.Password);


                await unitOfWork.UserRepository().Add(newUser);
                await unitOfWork.SaveChanges();

                var user = await (unitOfWork.UserRepository().GetAll(u => u.Role!, u => u.Img!, u => u.ResidenceCountry!, u => u
                .Gender!, u => u.Region!, u => u.BirthCountry!, u=>u.State!)).FirstOrDefaultAsync(u => u.Id == newUser.Id);


                await transaction.CommitAsync();

                if(user is null)
                {
                    AddError("User created but not loaded.");
                    return null;
                }


                var config = new TypeAdapterConfig();
                config.NewConfig<User, UserDto>()
                    .Map(dest => dest.Role, src => src.Role!.FullName)
                    .Map(dest => dest.Region, src => src.Region!.FullName)
                    .Map(dest => dest.Gender, src => src.Gender!.FullName)
                    .Map(dest => dest.BirthCountry, src => src.BirthCountry!.FullName)
                    .Map(dest => dest.ResidenceCountry, src => src.ResidenceCountry!.FullName)
                    .Map(dest => dest.State, src => src.State!.FullName)
                    .Map(dest => dest.ImgUrl, src => src.ImgId != null && src.Img != null 
                       ? src.Img.FileId.GetFileUrl() : null);

                //        var dto = new UserDto
                //        {
                //            Id = user.Id,
                //            FirstName = user.FirstName,
                //            LastName = user.LastName,
                //            MiddleName = user.MiddleName,
                //            Username = user.Username,
                //            BirthDate = user.BirthDate,
                //            Role = user.Role?.FullName,
                //            State = user.State?.FullName,
                //            Gender = user.Gender?.FullName,
                //            BirthCountry = user.BirthCountry?.FullName,
                //            ResidenceCountry = user.ResidenceCountry?.FullName,
                //            Region = user.Region?.FullName,
                //            ImgUrl = user.ImgId != null && user.Img != null
                //? user.Img.FileId.GetFileUrl()
                //: null
                //        };

                //return user.Adapt<UserDto>(config);
                return user.MapToDto<User, UserDto>(config);

            }
            catch (Exception ex) {
                if (transaction.GetDbTransaction().Connection != null)
                    await transaction.RollbackAsync();

                AddError(ex.Message);
                throw;
            }
        }

            
        private async Task<User?> GetUserByUsername(string username)
        {
            var user = await unitOfWork.UserRepository().GetAll(u => u.Role!, u => u.Img, u => u.ResidenceCountry!, u => u.ResidenceCountry!, u=> u.Gender!,u => u.Region!, u=>u.State!)
                .Where(x => x.Username.Equals(username) && x.StateId == StateIdConstants.Active).FirstOrDefaultAsync();

            return user;
        }

        private async Task<bool> UserNameExists(string username)
        {
                       return await unitOfWork.UserRepository().GetAll()
                .AnyAsync(u => u.Username.Equals(username));
        }



        public string HashPasword(User newUser, string password) =>
            new PasswordHasher<User>().HashPassword(newUser, password);

        private static PasswordVerificationResult VerifyPassword(User user, string password) =>
        
            new PasswordHasher<User>().VerifyHashedPassword(user, user.PasswordHash, password);
        

        private static readonly PasswordHasher<object> _hasher = new();

        public string HashPassword(string password)
        {
            return _hasher.HashPassword(null!, password);
        }

    }
}
