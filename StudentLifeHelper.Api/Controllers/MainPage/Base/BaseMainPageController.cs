using StudentLifeHelper.Api.Filters;
using StudentLifeHelper.Common.Dtos.SqlLog;
using StudentLifeHelper.Common.Models.Shared;
using StudentLifeHelper.Service.MainPage.Base.Interface;
using System.Reflection;

namespace StudentLifeHelper.Api.Controllers.MainPage.Base
{
    [ApiController]
    [Authorize]
    [Route("api/main-page/[controller]/[action]")]
    public abstract class BaseMainPageController<TService, TFilterOptions, TDto, TCreateModel, TUpdateModel>
        (TService service, SqlQueryStore sqlQueryStore) : ControllerBase
        where TService : IMainPageBaseService<TFilterOptions, TDto, TCreateModel, TUpdateModel>
        where TDto : class
    {
        private readonly TService _service = service;
        private readonly SqlQueryStore _sqlQueryStore = sqlQueryStore;

        [HttpPost]
        public async Task<IActionResult> GetAll([FromBody] TFilterOptions filterOptions)
        {
            var result = await _service.GetAllAsync(filterOptions);
            if (_service.HasErrors)
            {
                return BadRequest(_service.Errors);
            }
            return Ok(new ApiResponse<PaginationModel<TDto>>
            {
                Data = result,
                Queries = sqlQueryStore.GetAll().ToList()
            });
        }


        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(long id)
        {
            var result = await _service.GetByIdAsync(id);
            if (_service.HasErrors)
            {
                return BadRequest(_service.Errors);
            }

            return Ok(new ApiResponse<TDto?>
            {
                Data = result,
                Queries = _sqlQueryStore.GetAll().ToList()
            });

        }

        [HttpPost]
        public async Task<IActionResult> AddAsync([FromForm] TCreateModel createModel)
        {
            var result = await _service.AddAsync(createModel);
            if (_service.HasErrors)
            {
                return BadRequest(_service.Errors);
            }
            return Ok(new ApiResponse<long?>
            {
                Data = result,
                Queries = _sqlQueryStore.GetAll().ToList()
            });
        }


        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateAsync(long id, [FromBody] TUpdateModel updateModel)
        {

            SetModelId(updateModel, id);
            var result = await _service.UpdateAsync(updateModel, id);
            if (_service.HasErrors)
            {
                return BadRequest(_service.Errors);
            }
            return Ok(new ApiResponse<string?>
            {
                Data = result,
                Queries = _sqlQueryStore.GetAll().ToList()
            });
        }



        [HttpPut("{id:int}")]
        public async Task<IActionResult> ActivateAsync(long id)
        {
            var result = await _service.ActivateAsync(id);
            if (_service.HasErrors)
            {
                return BadRequest(_service.Errors);
            }
            return Ok(new ApiResponse<string?>
            {
                Data = result,
                Queries = _sqlQueryStore.GetAll().ToList()
            });
        }


        [HttpPut("{id:int}")]
        public async Task<IActionResult> DeactivateAsync(long id)
        {
            var result = await _service.DeactivateAsync(id);
            if (_service.HasErrors)
            {
                return BadRequest(_service.Errors);
            }
            return Ok(new ApiResponse<string?>
            {
                Data = result,
                Queries = _sqlQueryStore.GetAll().ToList()
            });
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> DeleteAsync(long id)
        {
            var result = await _service.DeleteAsync(id);
            if (_service.HasErrors)
            {
                return BadRequest(_service.Errors);
            }
            return Ok(new ApiResponse<string?>
            {
                Data = result,
                Queries = _sqlQueryStore.GetAll().ToList()
            });
        }


        private static void SetModelId(TUpdateModel model, long id)
        {
            var idProperty = typeof(TUpdateModel).GetProperty("Id", BindingFlags.Public | BindingFlags.Instance);
            if (idProperty != null && idProperty.CanWrite)
            {
                idProperty.SetValue(model, id);
            }
        }
    }
 }