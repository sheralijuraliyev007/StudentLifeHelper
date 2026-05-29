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
            var userId = userHelper.GetUserId();

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
                .Map(dest => dest.LanguageCode, src => src.LanguageCode)
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
                .FirstOrDefault(u => u.Username == username && u.StateCode == StateConstants.Active));

            bool isInvalid = user is null || user.RefreshToken != tokenDto.RefreshToken
    ||          user.RefreshTokenExpireTime <= DateTime.UtcNow;
            if (isInvalid)
            {
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
                    BirthDate = registerModel.BirthDate.HasValue ? DateTime.SpecifyKind(registerModel.BirthDate.Value, DateTimeKind.Utc) : null,
                    Username = registerModel.Username,
                    BirthCountryCode = registerModel.BirthCountryCode,
                    ResidenceCountryCode = registerModel.ResidenceCountryCode,
                    ImgId = contentId,
                    StateCode = StateConstants.Active,
                    GenderCode = registerModel.GenderCode,
                    RegionCode = registerModel.RegionCode,
                    RoleCode = RoleConstants.UserRoleCode,
                    RefreshTokenExpireTime = DateTime.UtcNow.AddHours(1),
                    CreatedUserId = userId,
                    LanguageCode = 1
                };
                newUser.PasswordHash = HashPasword(newUser, registerModel.Password);


                await unitOfWork.UserRepository().Add(newUser);
                await unitOfWork.SaveChanges();

                var user = await (unitOfWork.UserRepository().GetAll(u => u.Role!, u => u.Img!, u => u.ResidenceCountry!, u => u
                .Gender!, u => u.Region!, u => u.BirthCountry!, u=> u.Language!,u=>u.State!)).FirstOrDefaultAsync(u => u.Id == newUser.Id);


                await transaction.CommitAsync();

                if (user is null)
                {
                    // Try loading without joins to confirm user was saved
                    var rawUser = await unitOfWork.UserRepository().GetAll()
                        .FirstOrDefaultAsync(u => u.Id == newUser.Id);

                    Console.WriteLine($"Raw user exists: {rawUser != null}");
                    Console.WriteLine($"RegionCode: {newUser.RegionCode}");
                    Console.WriteLine($"GenderCode: {newUser.GenderCode}");
                    Console.WriteLine($"BirthCountryCode: {newUser.BirthCountryCode}");
                    Console.WriteLine($"ResidenceCountryCode: {newUser.ResidenceCountryCode}");

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
                    .Map(dest => dest.Language, src => src.Language!.FullName)
                    .Map(dest => dest.State, src => src.State!.FullName)
                    .Map(dest => dest.ImgUrl, src => src.ImgId != null && src.Img != null 
                       ? src.Img.FileId.GetFileUrl() : null);

                return user.MapToDto<User, UserDto>(config);

            }
            catch (Exception ex) {
                if (transaction.GetDbTransaction().Connection != null)
                    await transaction.RollbackAsync();

                AddError(ex.Message);
                throw;
            }
        }



        public async Task<string?> UpdateProfileAsync(UpdateUserModel updateProfileModel)
        {
            var userId = userHelper.GetUserId();
            if(userId == null)
            {
                return null; 
            }

            var (user, isExist) = await GetUserById(userId.Value);

            if (!isExist)
            {
                return null;
            }


            var userUpdate = updateProfileModel.MapForUpdate(user);

            userUpdate!.ModifiedDateTime = DateTime.UtcNow;
            userUpdate.ModifiedUserId = userId.Value;
            await unitOfWork.UserRepository().Update(userUpdate!);
            await unitOfWork.SaveChanges();

            return "User updated successfully.";

        }

        public async Task<string?> UpdateUsernameAsync(string newUsername)
        {
            var userId = userHelper.GetUserId();

            if (!userId.HasValue)
            {
                AddError("User not found");
                return null;
            }

            var (user, isExist) = await GetUserById(userId.Value);

            if (!isExist || user == null)
            {
                AddError("User not found");
                return null;
            }

            var userNameExists = await UserNameExists(newUsername);

            if (userNameExists)
            {
                AddError("Username already exists");
                return null;
            }

            user.Username = newUsername;

            await unitOfWork.UserRepository().Update(user);
            await unitOfWork.SaveChanges();

            return "Username updated successfully";
        }

        


        private async Task<User?> GetUserByUsername(string username)
        {
            var user = await unitOfWork.UserRepository().GetAll(u => u.Role!, u => u.Img, u => u.ResidenceCountry!, u => u.ResidenceCountry!, u=> u.Gender!,u => u.Region!, u=>u.State!)
                .Where(x => x.Username.Trim() == username.Trim() ).FirstOrDefaultAsync();

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

        public async Task<string?> UpdateUserImage(IFormFile img)
        {
            var userId = userHelper.GetUserId();

            if (!userId.HasValue)
            {
                AddError("User not found");
                return null;
            }

            var (user, isExist) = await GetUserById(userId.Value);

            if (!isExist || user == null)
            {
                AddError("User not found");
                return null;
            }

            long? contentId = user.ImgId;

            // FIRST IMAGE UPLOAD
            if (!contentId.HasValue)
            {
                user.ImgId = await contentService.CreateContentForImage(
                    img,
                    "profile"
                );
            }
            else
            {
                user.ImgId = await contentService.UpdateContentForImage(
                    contentId.Value,
                    img
                );
            }

            if (user.ImgId == null)
            {
                AddError("Image upload failed");
                return null;
            }

            user.ModifiedUserId = userId.Value;
            user.ModifiedDateTime = DateTime.UtcNow;

            await unitOfWork.UserRepository().Update(user);
            await unitOfWork.SaveChanges();

            return "User image updated successfully.";
        }

        private async Task<(User? user, bool isExist)> GetUserById(Guid userId)
        {
            var user = await unitOfWork.UserRepository().GetById(userId);

            if (user is null)
            {
                return new(null, false);
            }
            return new(user, true);
        }
    }
}
