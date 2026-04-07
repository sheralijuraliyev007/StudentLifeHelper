using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StudentLifeHelper.Api.Controllers.Public.Base;
using StudentLifeHelper.Common.Dtos.Auth;
using StudentLifeHelper.Common.Dtos.User;
using StudentLifeHelper.Common.Models.Auth;
using StudentLifeHelper.Service.Auth.Interfaces;

namespace StudentLifeHelper.Api.Controllers.Public
{
    public class AuthController(IAuthService service) : BasePublicController
    {
        [HttpPost]
        public async Task<ActionResult<UserDto>> Register([FromForm] RegisterModel registerModel)
        {
            var result = await service.RegisterAsync(registerModel);

            if (!service.IsValid)
                return BadRequest(service.Errors);

            if (result is null)
                return BadRequest("Registration failed.");

            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<TokenDto>> Login([FromForm] LoginModel loginModel)
        {
            var result = await service.LoginAsync(loginModel);

            if (!service.IsValid)
                return BadRequest(service.Errors);

            if (result is null)
                return BadRequest("Login failed.");

            return Ok(result);
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<UserDto>> GetProfile()
        {
            var result = await service.GetProfile();
            if (service.IsValid)
            {
                return Ok(result);
            }
            return BadRequest();
        }

        [HttpPost]
        public async Task<ActionResult<string>> RefreshToken([FromBody] TokenDto tokenDto)
        {
            var result = await service.RefreshTokenAsync(tokenDto);
            if (service.IsValid)
            {
                return Ok(result);
            }
            return BadRequest();
        }
    }
}
