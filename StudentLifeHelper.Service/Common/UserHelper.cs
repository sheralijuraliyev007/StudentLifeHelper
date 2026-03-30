using Microsoft.AspNetCore.Http;
using StudentLifeHelper.Service.Common.Interfaces;
using System.Security.Claims;


namespace StudentLifeHelper.Service.Common
{

    public class UserHelper(IHttpContextAccessor httpContextAccessor) : IUserHelper
    {
        public string GetUserId() => httpContextAccessor.HttpContext!.User.FindFirst(ClaimTypes.NameIdentifier)!.Value;

        public string GetUsername() => httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.Name)!.Value;

        public string GetUserRole() => httpContextAccessor.HttpContext.User.FindFirst(ClaimTypes.Role)!.Value;

        public int GetUserRoleId() => int.Parse(httpContextAccessor.HttpContext.User.FindFirst("role_id")!.Value);
    }
}
