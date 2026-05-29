

namespace StudentLifeHelper.Api.Controllers.Admin.Info
{
    public class RoomPostTypeController(IBaseInfoService<RoomPostType> service, SqlQueryStore sqlQueryStore) : BaseInfoController<RoomPostType, BaseInfoCreateModel, BaseInfoUpdateModel, InfoDto, int>(service, sqlQueryStore)
    {
    }
}
