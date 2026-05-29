namespace StudentLifeHelper.Api.Controllers.Admin.Info
{

    public class LanguageController(IBaseInfoService<Language> service, SqlQueryStore sqlQueryStore) : BaseInfoController<Language, BaseInfoCreateModel, BaseInfoUpdateModel, InfoDto, int>(service, sqlQueryStore  )
    {
    }
}
