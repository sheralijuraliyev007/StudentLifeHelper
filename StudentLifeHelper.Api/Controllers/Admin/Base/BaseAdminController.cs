namespace StudentLifeHelper.Api.Controllers.Admin.Base
{
    [Authorize(Roles = RoleConstants.AdminRoleFullName)]
    [Route("api/admin/[controller]/[action]")]
    [ApiController]
    public abstract class BaseAdminController : ControllerBase
    {
    }
}
