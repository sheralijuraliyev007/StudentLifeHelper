using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StudentLifeHelper.Service.Admin;

namespace StudentLifeHelper.Api.Controllers.Admin.Base
{
    public abstract class BaseInfoController<TEntity, TCreateModel,TUpdateModel,TDto,TId>(IBaseInfoService<TEntity> service) : BaseAdminController
        where TEntity : class
    {
        [HttpGet]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> GetAll() { 
            var result = await service.GetAll<TDto>();
            if (service.IsValid)
            {
                return Ok(result);
            }
            return BadRequest();
        }

    }
}
