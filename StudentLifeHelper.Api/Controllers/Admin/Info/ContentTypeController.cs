namespace StudentLifeHelper.Api.Controllers.Admin.Info
{
    public class ContentTypeController(IBaseInfoService<ContentType> service, SqlQueryStore sqlQueryStore) : BaseInfoController<ContentType, InfoContentTypeCreateModel, InfoContentTypeUpdateModel,ContentTypeDto, int>(service, sqlQueryStore)
    {
    }
}
