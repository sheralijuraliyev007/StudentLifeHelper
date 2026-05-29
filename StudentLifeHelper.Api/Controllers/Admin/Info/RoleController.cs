namespace StudentLifeHelper.Api.Controllers.Admin.Info
{
    public class RoleController(IBaseInfoService<Role> service, SqlQueryStore sqlQueryStore) : BaseInfoController<Role, BaseInfoCreateModel, BaseInfoUpdateModel, InfoDto, int>(service, sqlQueryStore)
    {

    }

}
