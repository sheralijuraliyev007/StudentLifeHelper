using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StudentLifeHelper.Api.Controllers.Admin.Base;
using StudentLifeHelper.Common.Dtos.Info;
using StudentLifeHelper.Common.Models.Info;
using StudentLifeHelper.Data.Entities.InfoEntities;
using StudentLifeHelper.Service.Admin;

namespace StudentLifeHelper.Api.Controllers.Admin.Info
{
    public class RoomPostTypeController(IBaseInfoService<RoomPostType> service) : BaseInfoController<RoomPostType, BaseInfoCreateModelWithTableId, BaseInfoUpdateModel, InfoDto, int>(service)
    {
    }
}
