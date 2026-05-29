

namespace StudentLifeHelper.Api.Controllers.Admin.Info
{
    public class GenderController(IBaseInfoService<Gender> service, SqlQueryStore sqlQueryStore) : BaseInfoController<Gender, BaseInfoCreateModel, BaseInfoUpdateModel, InfoDto, int>(service, sqlQueryStore)
    {
    }
}
