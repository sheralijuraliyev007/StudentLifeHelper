using StudentLifeHelper.Api.Filters;
using StudentLifeHelper.Common.Dtos.SqlLog;
using StudentLifeHelper.Common.Models.User;
using StudentLifeHelper.Service.Admin.Users;

namespace StudentLifeHelper.Api.Controllers.Public
{
    public class AuthController(IAuthService service, SqlQueryStore sqlQueryStore) : BasePublicController
    {
        private readonly SqlQueryStore _sqlQueryStore = sqlQueryStore;
        [HttpPost]
        public async Task<ActionResult<UserDto>> Register([FromForm] RegisterModel registerModel)
        {
            var result = await service.RegisterAsync(registerModel);

            if (!service.IsValid)
                return BadRequest(service.Errors);

            if (result is null)
                return BadRequest("Registration failed.");

            return Ok(new ApiResponse<UserDto?>
            {
                Data = result,
                Queries = _sqlQueryStore.GetAll().ToList()
            });
        }

        [HttpPost]
        public async Task<ActionResult<TokenDto>> Login([FromForm] LoginModel loginModel)
        {
            var result = await service.LoginAsync(loginModel);

            if (!service.IsValid)
                return BadRequest(service.Errors);

            if (result is null)
                return BadRequest("Login failed.");

            return Ok(new ApiResponse<TokenDto?>
            {
                Data = result,
                Queries = _sqlQueryStore.GetAll().ToList()
            });
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<UserDto>> GetProfile()
        {
            var result = await service.GetProfile();
            if (service.IsValid)
            {
                return Ok(new ApiResponse<UserDto?>
                {
                    Data = result,
                    Queries = _sqlQueryStore.GetAll().ToList()
                });
            }
            return BadRequest();
        }

        [HttpPost]
        public async Task<ActionResult<string>> RefreshToken([FromBody] TokenDto tokenDto)
        {
            var result = await service.RefreshTokenAsync(tokenDto);
            if (service.IsValid)
            {
                return Ok(new ApiResponse<TokenDto?>
                {
                    Data = result,
                    Queries = _sqlQueryStore.GetAll().ToList()
                });
            }
            return BadRequest();
        }


        [HttpPost]
        [Authorize]
        public async Task<ActionResult<UserDto>> UpdateProfile(UpdateUserModel updateUserModel)
        {
            var result = await service.UpdateProfileAsync(updateUserModel);
            if (service.IsValid)
            {
                return Ok(new ApiResponse<string?>
                {
                    Data = result,
                    Queries = _sqlQueryStore.GetAll().ToList()
                });
            }
            return BadRequest();
        }


        [HttpPost]
        [Authorize]
        public async Task<IActionResult> UpdateUsername(string newUsername)
        {
            var result = await service.UpdateUsernameAsync(newUsername);
            if (service.IsValid)
            {
                return Ok(new ApiResponse<string?>
                {
                    Data = result,
                    Queries = _sqlQueryStore.GetAll().ToList()
                });
            }
            return BadRequest();

        }

        [HttpPut]
        [Authorize]
        public async Task<IActionResult> UpdateUserImage(IFormFile img)
        {
            var result = await service.UpdateUserImage(img);
            if (service.IsValid) return Ok(new ApiResponse<string?>
            {
                Data = result,
                Queries = _sqlQueryStore.GetAll().ToList()
            });
            return BadRequest(service.Errors);


        }
    }
}
