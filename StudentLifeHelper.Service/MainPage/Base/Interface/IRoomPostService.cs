using StudentLifeHelper.Common.Dtos.MainPage;
using StudentLifeHelper.Common.Models.MainPage.RoomPost;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Service.MainPage.Base.Interface
{
    public interface IRoomPostService :
            IMainPageBaseService<RoomPostFilterOptions, RoomPostDto, CreateRoomPostModel, UpdateRoomPostModel>
    {
        Task<string?> AddContentAsync(long roomPostId, List<IFormFile> files);
        Task<string?> DeleteContentAsync(long roomPostId, long contentId);
        Task<string?> SetCoverAsync(long roomPostId, long contentId);
        Task<PaginationModel<RoomPostDto>?> GetUserPosts(RoomPostFilterOptions filters);
    }
}
