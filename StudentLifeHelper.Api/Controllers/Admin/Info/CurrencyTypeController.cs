using StudentLifeHelper.Api.Controllers.Admin.Base;
using StudentLifeHelper.Common.Dtos.Info;
using StudentLifeHelper.Common.Models.Info.CurrencyType;
using StudentLifeHelper.Data.Entities.InfoEntities;
using StudentLifeHelper.Service.Admin;

namespace StudentLifeHelper.Api.Controllers.Admin.Info
{
    public class CurrencyTypeController(IBaseInfoService<CurrencyType> service) : BaseInfoController<CurrencyType, InfoCurrencyTypeCreateModel, InfoCurrencyTypeUpdateModel, CurrencyTypeDto, int>(service)
    {
    }
}
