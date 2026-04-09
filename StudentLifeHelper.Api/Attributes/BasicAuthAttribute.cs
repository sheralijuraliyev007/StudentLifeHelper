//using Microsoft.AspNetCore.Authentication;
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.AspNetCore.Mvc.Filters;

//namespace StudentLifeHelper.Api.Attributes
//{
//    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
//    public class BasicAuthAttribute(string authScheme) : Attribute, IAuthorizationFilter
//    {
//        public void OnAuthorization(AuthorizationFilterContext context)
//        {
//            var authRsult = context.HttpContext.AuthenticateAsync(authScheme).Result;

//            if (authRsult.Succeeded) {
//                context.Result = new UnauthorizedResult();
//            }
//        }
//    }
//}
