using StudentLifeHelper.Common.Models.Info.CurrencyType;


namespace StudentLifeHelper.Api.Controllers.Admin.Info
{
    public class CurrencyTypeController(IBaseInfoService<CurrencyType> service, SqlQueryStore sqlQueryStore) : BaseInfoController<CurrencyType, InfoCurrencyTypeCreateModel, InfoCurrencyTypeUpdateModel, CurrencyTypeDto, int>(service, sqlQueryStore)
    {
    }
}
