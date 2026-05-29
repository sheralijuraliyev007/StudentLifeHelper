namespace StudentLifeHelper.Api.Controllers.Admin.Info
{
    public class CountryController(IBaseInfoService<Country> service, SqlQueryStore sqlQueryStore) : BaseInfoController<Country,BaseInfoCreateModel, BaseInfoUpdateModel, InfoDto , int>(service,sqlQueryStore)
    {

    }
}
