using StudentLifeHelper.Service.Admin.User.Interfaces;
using StudentLifeHelper.Service.Admin.User.QueryObjects;



namespace StudentLifeHelper.Service.Admin.Users
{
    public class AdminUserService(IUnitOfWork unitOfWork, IContentService contentService, IUserHelper userHelper) : StatusGenericHandler, IAdminUserService
    {
        public async Task<string?> ActivateAsync(Guid userId) =>
            await UpdateStateAsync(userId, StateConstants.Active, "User activated successfully.");
        

        public async Task<string?> DeactivateAsync(Guid userId) =>
            await UpdateStateAsync(userId, StateConstants.Passive, "User deactivated successfully.");

        public async Task<string?> DeleteAsync(Guid userId)
        {
            var (user, isExist) = GetUserById(userId).Result;
            if (user == null ) return "User not found.";

            //await contentService.DeleteContentForImage(user.Img!.Id);

            await unitOfWork.UserRepository().Delete(user!);
            await unitOfWork.SaveChanges();
            return "User deleted successfully.";
        }
        public async Task<UserDtoForAdmin?> GetByUsernameAsync(string userName)
        {

            var query = unitOfWork.UserRepository()
               .GetAll(
               u => u.Role!,
               u => u.State!,
               u => u.Gender!,
               u => u.BirthCountry!,
               u => u.ResidenceCountry!,
               u => u.Region!,
               u => u.Img!,
               u => u.Language!
           ).AsNoTracking();
            var user = await query.Where(u => u.Username == userName).FirstOrDefaultAsync();

            if (user is null)
            {

                AddError("User not found.");
                return null;
            }

            var config = GetCustomConfig();

            return user.MapToDto<Data.Entities.MainEntities.User, UserDtoForAdmin>(config);
        }

        public async Task<PaginationModel<UserDtoForAdmin>> GetAllAsync(AdminUserFilterOptions filterOptions)
        {
            var query = unitOfWork.UserRepository()
               .GetAll(
               u => u.Role!,
               u => u.State!,
               u=> u.Gender!,
               u=> u.BirthCountry!,
               u=> u.ResidenceCountry!,
               u=> u.Region!,
               u => u.Img!,
               u=> u.Language!
           ).AsNoTracking();

            var config = GetCustomConfig();

            return query.ApplyFilter(filterOptions)
                .MapToDtos<Data.Entities.MainEntities.User, UserDtoForAdmin>(config).
                ToPaginationModel(filterOptions.Page, filterOptions.PageSize);
        }

        public async Task<string?> UpdateAsync(Guid userId, UpdateUserModelForAdmin updateModel)
        {
            var (isExist, user) =await GetUserById(userId, isInclude : false);

            if (!isExist) { 
                return null;
            }
            bool isValidRole = ValidateRoleId(updateModel.RoleCode);

            if (!isValidRole) return null;
            var updateUser = updateModel.MapForUpdate(user);

            updateUser!.ModifiedUserId = userHelper.GetUserId();
            updateUser.ModifiedDateTime = DateTime.UtcNow;
            await unitOfWork.UserRepository().Update(updateUser!);
            await unitOfWork.SaveChanges();

            return "User updated successfully.";
        }

        public async Task<string?> UpdateUserImage(Guid userId, IFormFile img)
        {
            var (isExist, user) = await GetUserById(userId, true);

            if (!isExist)
            {
                return null;
            }
            long? contentId = user!.Img.Id;

            if (contentId.HasValue)
            {
                user!.ImgId = await contentService.UpdateContentForImage(user.ImgId!.Value , img);

            }
            else
            {
                return "User does not have an existing image to update.";
            }

            user.ModifiedUserId = userHelper.GetUserId();
            user.ModifiedDateTime = DateTime.UtcNow;

            await unitOfWork.UserRepository().Update(user);
            await unitOfWork.SaveChanges();
            return "User image updated successfully.";


        }


        private TypeAdapterConfig GetCustomConfig()
        {
            var newConfig = new TypeAdapterConfig();
            newConfig.NewConfig<Data.Entities.MainEntities.User, UserDtoForAdmin>()
                .Map(dest => dest.Role, src => src.Role!.FullName)
                .Map(dest => dest.State, src => src.State!.FullName)
                .Map(dest => dest.Gender, src => src.Gender!.FullName)
                .Map(dest => dest.BirthCountry, src => src.BirthCountry!.FullName)
                .Map(dest => dest.ResidenceCountry, src => src.ResidenceCountry!.FullName)
                .Map(dest => dest.Language, src => src.Language!.FullName)
                .Map(dest => dest.Region, src => src.Region!.FullName)
                .Map(dest => dest.ImgUrl, src => $"{src.Img!.Folder}/{src.Img!.Name}");

            return newConfig;
        }



        private async Task<string?> UpdateStateAsync(Guid userId, int targetStateCode,string message)
        {
            var(user, isExist) = await GetUserById(userId);



            if (!isExist) return null;

            user!.StateCode = targetStateCode;
            user.ModifiedUserId =  userHelper.GetUserId();
            user.ModifiedDateTime = DateTime.UtcNow;
            await unitOfWork.UserRepository().Update(user);
            await unitOfWork.SaveChanges();
            return message;

        }

        private async Task<(Data.Entities.MainEntities.User? user,bool isExist)> GetUserById(Guid userId)
        {
            var user = await unitOfWork.UserRepository().GetById(userId);

            if(user is null)
            {
                return (null, false);
            }

            return (user, true);
        }


        private async Task<(bool isExist, Data.Entities.MainEntities.User ? user)> GetUserById(Guid userId, bool isInclude = false)
        {
         
            var query = isInclude ?( unitOfWork.UserRepository().GetAll(u => u.Role!, u => u.State!, u => u.Gender!, u => u.BirthCountry!, u => u.ResidenceCountry!, u => u.Region!, u => u.Img!, u => u.Language!) )
                : unitOfWork.UserRepository().GetAll();

            var user = await query.Where(u => u.Id == userId).FirstOrDefaultAsync();

            if (user is null) {
                AddError("User not found.");
                return new(false, null);
            }
            return new(true, user);

        }


        private bool ValidateRoleId(int? roleId)
        {
            if (!roleId.HasValue) return true;
            if (roleId < 0)
            {
                AddError("RoleId must be a positive integer.");
                return false;
            }

            bool isValid = roleId == RoleConstants.UserRoleCode;
            if (!isValid)
            {
                AddError($"Invalid RoleId. Allowed value is {RoleConstants.UserRoleCode}.");
                return false;
            }

            return true;
        }
    }
}
