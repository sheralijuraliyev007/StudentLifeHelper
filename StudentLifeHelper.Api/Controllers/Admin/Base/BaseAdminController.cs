using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StudentLifeHelper.Common.Constants;

namespace StudentLifeHelper.Api.Controllers.Admin.Base
{
    [Authorize(Roles = RoleConstants.AdminRoleFullName)]
    [Route("api/admin/[controller]/action")]
    [ApiController]
    public abstract class BaseAdminController : ControllerBase
    {
    }
}
