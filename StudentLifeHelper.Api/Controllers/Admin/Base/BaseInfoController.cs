using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StudentLifeHelper.Service.Admin;

namespace StudentLifeHelper.Api.Controllers.Admin.Base
{
    public abstract class BaseInfoController<TEntity, TCreateModel, TUpdateModel, TDto, TId>(IBaseInfoService<TEntity> service) : BaseAdminController
        where TEntity : class
    {
        [HttpGet]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> GetAll()
        {
            var result = await service.GetAll<TDto>();
            if (service.IsValid)
            {
                return Ok(result);
            }
            return BadRequest();
        }

        [HttpGet]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> GetById(TId id)
        {
            var result = await service.GetById<TDto, TId>(id);
            if (service.IsValid)
            {
                return Ok(result);
            }
            return BadRequest();
        }

        [HttpPost]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> Create(TCreateModel model)
        {
            var result = await service.Create(model);
            if (service.IsValid)
            {
                return Ok(result);
            }
            return BadRequest();
        }

        [HttpPost]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> Update(TId id, TUpdateModel model)
        {
            var result = await service.Update(id, model);
            if (service.IsValid)
            {
                return Ok(result);
            }
            return BadRequest();

        }

        [HttpDelete]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> Delete(TId id)
        {
            var result = await service.DeleteById(id);
            if (service.IsValid)
            {
                return Ok(result);
            }
            return BadRequest();

        }
    }
}