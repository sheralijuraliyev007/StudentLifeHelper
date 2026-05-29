namespace StudentLifeHelper.Api.Controllers.Admin.Base
{
    public abstract class BaseInfoController<TEntity, TCreateModel, TUpdateModel, TDto, TId>  : BaseAdminController
        where TEntity : class
    {

        protected readonly IBaseInfoService<TEntity> service;
        private readonly SqlQueryStore _sqlQueryStore;

        protected BaseInfoController(IBaseInfoService<TEntity> service, SqlQueryStore sqlQueryStore)
        {
            this.service = service;
            _sqlQueryStore = sqlQueryStore;
        }


        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            var result = await service.GetAll<TDto>();
            if (service.IsValid)
            {
                return Ok(new ApiResponse<IEnumerable<TDto>>
                {
                    Data = result,
                    Queries = _sqlQueryStore.GetAll().ToList()
                });
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
                return Ok(new ApiResponse<TDto?>
                {
                    Data = result,
                    Queries = _sqlQueryStore.GetAll().ToList()
                });
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
                return Ok(new ApiResponse<string?>
                {
                    Data = result,
                    Queries = _sqlQueryStore.GetAll().ToList()
                });
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
                return Ok(new ApiResponse<string?>
                {
                    Data = result,
                    Queries = _sqlQueryStore.GetAll().ToList()
                });
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
                return Ok(new ApiResponse<string?>
                {
                    Data = result,
                    Queries = _sqlQueryStore.GetAll().ToList()
                });
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
                return Ok(new ApiResponse<string?>
                {
                    Data = result,
                    Queries = _sqlQueryStore.GetAll().ToList()
                });
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
                return Ok(new ApiResponse<string?>
                {
                    Data = result,
                    Queries = _sqlQueryStore.GetAll().ToList()
                });
            }
            return BadRequest();
        }
    }
}