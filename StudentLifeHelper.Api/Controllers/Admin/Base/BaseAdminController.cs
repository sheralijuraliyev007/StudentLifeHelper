using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace StudentLifeHelper.Api.Controllers.Admin.Base
{
    [Route("api/[controller]")]
    [ApiController]
    public abstract class BaseAdminController : ControllerBase
    {
    }
}
