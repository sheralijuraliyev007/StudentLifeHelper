using StudentLifeHelper.Api.Controllers.Admin.Base;
using StudentLifeHelper.Common.Dtos.Info;
using StudentLifeHelper.Common.Models.Info;
using StudentLifeHelper.Data.Entities.InfoEntities;
using StudentLifeHelper.Service.Admin;

namespace StudentLifeHelper.Api.Controllers.Admin.Info
{
    public class CountryController(IBaseInfoService<Country> service) : BaseInfoController<Country,BaseInfoCreateModelWithTableId, BaseInfoUpdateModel, InfoDto , int>(service)
    {

    }
}
