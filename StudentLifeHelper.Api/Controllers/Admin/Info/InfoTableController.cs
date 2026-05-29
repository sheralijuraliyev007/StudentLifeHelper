namespace StudentLifeHelper.Api.Controllers.Admin.Info
{
    public class InfoTableController(IBaseInfoService<InfoTable> service, SqlQueryStore sqlQueryStore) : BaseInfoController<InfoTable, BaseInfoCreateModel, BaseInfoUpdateModel, InfoDto, int>(service, sqlQueryStore)
    {
    }
}
