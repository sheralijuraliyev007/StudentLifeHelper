using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StudentLifeHelper.Api.Controllers.Admin.Base;
using StudentLifeHelper.Common.Dtos.Info;
using StudentLifeHelper.Common.Models.Info;
using StudentLifeHelper.Data.Entities.InfoEntities;
using StudentLifeHelper.Service.Admin;

namespace StudentLifeHelper.Api.Controllers.Admin.Info
{

    public class LanguageController(IBaseInfoService<Language> service) : BaseInfoController<Language, BaseInfoCreateModel, BaseInfoUpdateModel, InfoDto, int>(service)
    {
    }
}
