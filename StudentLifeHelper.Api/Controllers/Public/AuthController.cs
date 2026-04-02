using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StudentLifeHelper.Api.Controllers.Public.Base;
using StudentLifeHelper.Common.Models.Auth;
using StudentLifeHelper.Service.Auth.Interfaces;

namespace StudentLifeHelper.Api.Controllers.Public
{
    public class AuthController(IAuthService service) : BasePublicController
    {
        [HttpPost]
        public async Task<ActionResult<string>> Register([FromForm] RegisterModel registerModel)
        {
            var result =await  service.RegisterAsync(registerModel);
            if (service.IsValid)
            {
                return Ok(result);
            }
            return BadRequest();
        }
    }
}
