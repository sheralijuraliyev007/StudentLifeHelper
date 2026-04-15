using Microsoft.AspNetCore.Http;
using StudentLifeHelper.Data.Repositories.Interfaces;
using StudentLifeHelper.Service.Common.Interfaces;
using System.Security.Claims;
using System.Threading.Tasks;


namespace StudentLifeHelper.Service.Common
{

    public class UserHelper(IHttpContextAccessor httpContextAccessor, IUnitOfWork unitOfWork) : IUserHelper
    {
        public Guid GetUserId() => Guid.Parse((httpContextAccessor.HttpContext!.User.FindFirst(ClaimTypes.NameIdentifier)!.Value) );

        //public async Task<int> GetUserLanguageCode()
        //{
        //    var userId = GetUserId();

        //    var user = await unitOfWork.UserRepository().GetById(userId);

        //    return user!.LanguageCode;

        //}

        public async Task<int> GetUserLanguageCode() => (await unitOfWork.UserRepository().GetById(GetUserId()))!.LanguageCode;

        public string GetUsername() => httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.Name)!.Value;

        public string GetUserRole() => httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.Role)!.Value;

        public int GetUserRoleId() => int.Parse(httpContextAccessor.HttpContext.User.FindFirst("role_id")!.Value);

        
    }
}
