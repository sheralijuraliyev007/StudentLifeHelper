

namespace StudentLifeHelper.Api.Controllers.Admin.Info
{
    public class RoomTypeController(IBaseInfoService<RoomType> service, SqlQueryStore sqlQueryStore) : BaseInfoController<RoomType, BaseInfoCreateModel, BaseInfoUpdateModel, InfoDto, int>(service, sqlQueryStore)
    {
    }
}
