

namespace StudentLifeHelper.Service.Admin.User.Interfaces
{
    public interface IAdminUserService : IStatusGeneric
    {
        Task<PaginationModel<UserDtoForAdmin>> GetAllAsync(AdminUserFilterOptions filterOptions);

        Task<UserDtoForAdmin?> GetByUsernameAsync(string userName);

        Task<string?> ActivateAsync(Guid userId);

        Task<string?> DeactivateAsync(Guid userId);

        Task<string?> UpdateAsync(Guid userId, UpdateUserModelForAdmin updateModel);

        Task<string?> UpdateUserImage(Guid userId, IFormFile img);

        Task<string?> DeleteAsync(Guid userId);

    }
}
