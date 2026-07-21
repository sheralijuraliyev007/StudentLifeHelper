namespace StudentLifeHelper.Service.Common.Interfaces
{
    public interface IUserHelper
    {
        Guid? GetUserId();

        string GetUsername();

        string GetUserRole();
        int GetUserRoleId();

        Task<int> GetUserLanguageCode();
    }
}
