using StudentLifeHelper.Api.Controllers.MainPage.Base;
using StudentLifeHelper.Api.Filters;
using StudentLifeHelper.Common.Dtos.MainPage;
using StudentLifeHelper.Common.Dtos.SqlLog;
using StudentLifeHelper.Common.FilterOptions;
using StudentLifeHelper.Common.Models.MainPage.RoomPost;
using StudentLifeHelper.Common.Models.Shared;
using StudentLifeHelper.Service.MainPage;


namespace StudentLifeHelper.Api.Controllers.MainPage
{
    public class RoomPostsController(RoomPostService roomPostService, SqlQueryStore sqlQueryStore)
    : BaseMainPageController<
        RoomPostService,
        RoomPostFilterOptions,
        RoomPostDto,
        CreateRoomPostModel,
        UpdateRoomPostModel>(roomPostService, sqlQueryStore)
    {

        private readonly RoomPostService _roomPostService = roomPostService;
        private readonly SqlQueryStore _sqlQueryStore = sqlQueryStore;

        [HttpPost("{id:long}")]
        public async Task<IActionResult> AddContentAsync(long id, [FromForm] List<IFormFile> files)
        {
            var result = await _roomPostService.AddContentAsync(id, files);
            if (_roomPostService.HasErrors)
            {
                return BadRequest(_roomPostService.Errors);
            }
            return Ok(new ApiResponse<string?>
            {
                Data = result,
                Queries = _sqlQueryStore.GetAll().ToList()
            });
        }

        [HttpPost]
        public async Task<IActionResult> GetUserRoomPostsAsync([FromBody] RoomPostFilterOptions filterOptions) 
        {
            var result = await _roomPostService.GetUserPosts(filterOptions);
            if (_roomPostService.HasErrors)
            {
                return BadRequest(_roomPostService.Errors);
            }
            return Ok(new ApiResponse<PaginationModel<RoomPostDto>?>
            {
                Data = result,
                Queries = _sqlQueryStore.GetAll().ToList()  // ← _sqlQueryStore not sqlQueryStore
            }); ;

        }

        [HttpDelete("{roomPostId:long}/{contentId:long}")]
        public async Task<IActionResult> DeleteContentAsync(long roomPostId, long contentId)
        {
            var result = await _roomPostService.DeleteContentAsync(roomPostId, contentId);
            if (_roomPostService.HasErrors)
                return BadRequest(_roomPostService.Errors);
            return Ok(new ApiResponse<string?>
            {
                Data = result,
                Queries = _sqlQueryStore.GetAll().ToList()
            });
        }

        [HttpPut("{roomPostId:long}/{contentId:long}")]
        public async Task<IActionResult> SetCoverAsync(long roomPostId, long contentId)
        {
            var result = await _roomPostService.SetCoverAsync(roomPostId, contentId);
            if (_roomPostService.HasErrors)
                return BadRequest(_roomPostService.Errors);
            return Ok(new ApiResponse<string?>
            {
                Data = result,
                Queries = _sqlQueryStore.GetAll().ToList()
            });
        }
    }
}
