
using StudentLifeHelper.Api.Controllers.MainPage.Base;
using StudentLifeHelper.Api.Filters;
using StudentLifeHelper.Common.Dtos.MainPage;
using StudentLifeHelper.Common.Dtos.SqlLog;
using StudentLifeHelper.Common.FilterOptions;
using StudentLifeHelper.Common.Models.MainPage.CurrencyPost;
using StudentLifeHelper.Common.Models.Shared;


namespace StudentLifeHelper.Api.Controllers.MainPage
{
    public class CurrencyPostsController(CurrencyPostService currencyPostService, SqlQueryStore sqlQueryStore) : BaseMainPageController<CurrencyPostService, CurrencyPostFilterOptions, CurrencyPostDto, CreateCurrencyPostModel, UpdateCurrencyPostModel>(currencyPostService, sqlQueryStore)
    {
        private readonly CurrencyPostService _currencyPostService = currencyPostService;
        private readonly SqlQueryStore _sqlQueryStore = sqlQueryStore;

        [HttpPost]
        public async Task<IActionResult> GetUserCurrencyPostsAsync([FromBody] CurrencyPostFilterOptions filterOptions)
        {
            var result = await _currencyPostService.GetUserPosts(filterOptions);
            if (_currencyPostService.HasErrors)
                return BadRequest(_currencyPostService.Errors);
            return Ok(new ApiResponse<PaginationModel<CurrencyPostDto>?>
            {
                Data = result,
                Queries = _sqlQueryStore.GetAll().ToList()  // ← _sqlQueryStore not sqlQueryStore
            }); ;
        }
    }
}
