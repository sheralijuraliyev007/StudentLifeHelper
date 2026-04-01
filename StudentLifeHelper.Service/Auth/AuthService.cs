using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using StatusGeneric;
using StudentLifeHelper.Common.Constants;
using StudentLifeHelper.Common.Dtos.Auth;
using StudentLifeHelper.Common.Dtos.User;
using StudentLifeHelper.Common.Models.Auth;
using StudentLifeHelper.Data.Entities.MainEntities;
using StudentLifeHelper.Data.Repositories.Interfaces;
using StudentLifeHelper.Service.Auth.Interfaces;
using StudentLifeHelper.Service.Common.Interfaces;
using StudentLifeHelper.Service.Public.Content.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Service.Auth
{
    public class AuthService(IUnitOfWork unitOfWork, IContentService contentService, JwtService jwtService, IUserHelper userHelper) : StatusGenericHandler, IAuthService
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

        public Task<UserDto?> GetProfile()
        {

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

            }
            catch (Exception ex) { 

            
            }
        }


        private async Task<User?> GetUserByUsername(string username)
        {
            var user = await unitOfWork.UserRepository().GetAll(u => u.Role!)
                .Where(x => x.Username.Equals(username) && x.StateId == StateIdConstants.Active).FirstOrDefaultAsync();

            return user;
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
