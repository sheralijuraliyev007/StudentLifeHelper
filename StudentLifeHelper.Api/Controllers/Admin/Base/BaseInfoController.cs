using Microsoft.AspNetCore.Authorization;

using Microsoft.AspNetCore.Mvc;

using StudentLifeHelper.Service.Admin;

namespace StudentLifeHelper.Api.Controllers.Admin.Base
{
    public abstract class BaseInfoController<TEntity, TCreateModel, TUpdateModel, TDto, TId>  : BaseAdminController
        where TEntity : class
    {

        protected readonly IBaseInfoService<TEntity> service;

        protected BaseInfoController(IBaseInfoService<TEntity> service)
        {
            this.service = service;
        }


        [HttpGet]
        [Authorize]
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
        [Authorize]
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
        [Authorize]
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
        [Authorize]
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
        [Authorize]
        public async Task<IActionResult> Delete(TId id)
        {
            var result = await service.DeleteById(id);
            if (service.IsValid)
            {
                return Ok(result);
            }
            return BadRequest();

        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> MakePassive(TId id)
        {
            var result = await service.MakePassiveById(id);
            if (service.IsValid)
            {
                return Ok(result);
            }
            return BadRequest();
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> MakeActive(TId id)
        {
            var result = await service.MakeActiveById(id);
            if (service.IsValid)
            {
                return Ok(result);
            }
            return BadRequest();
        }
    }
}