
namespace StudentLifeHelper.Service.Common
{

    public class UserHelper(IHttpContextAccessor httpContextAccessor, IUnitOfWork unitOfWork) : IUserHelper
    {
        public Guid? GetUserId() => Guid.TryParse(
            httpContextAccessor.HttpContext?.User?
            .FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id
            )
            ? id : null;

        public async Task<int> GetUserLanguageCode()
        {
            if(GetUserId() == null)
            {
                return 1; 
            }
            return (await unitOfWork.UserRepository().GetById(GetUserId()!.Value))!.LanguageCode;
        }

        public string GetUsername() => httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.Name)!.Value;

        public string GetUserRole() => httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.Role)!.Value;

        public int GetUserRoleId() => int.Parse(httpContextAccessor.HttpContext.User.FindFirst("role_id")!.Value);

        
    }
}
