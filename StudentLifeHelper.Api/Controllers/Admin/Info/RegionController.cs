
namespace StudentLifeHelper.Api.Controllers.Admin.Info
{
    public class RegionController(IBaseInfoService<Region> service, SqlQueryStore sqlQueryStore) : BaseInfoController<Region, InfoRegionCreateModel, InfoRegionUpdateModel, InfoDto, int>(service, sqlQueryStore)
    {

    }
}
