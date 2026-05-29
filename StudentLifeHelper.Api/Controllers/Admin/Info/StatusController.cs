

namespace StudentLifeHelper.Api.Controllers.Admin.Info
{

    public class StatusController(IBaseInfoService<Status> service, SqlQueryStore sqlQueryStore) : BaseInfoController<Status, BaseInfoCreateModel, BaseInfoUpdateModel, InfoDto, int>(service, sqlQueryStore)
    {
    }
}
