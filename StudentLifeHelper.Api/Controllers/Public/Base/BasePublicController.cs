using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace StudentLifeHelper.Api.Controllers.Public.Base
{
    [Route("api/public/[controller]/[action]")]
    [ApiController]
    public abstract class BasePublicController : ControllerBase
    {
    }
}
