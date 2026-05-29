using StudentLifeHelper.Api.Controllers.Chat.Base;
using StudentLifeHelper.Service.Chat.Interfaces;

namespace StudentLifeHelper.Api.Controllers.Chat
{
    public class UserChatController(IUserChatService userChatService, SqlQueryStore sqlQueryStore) : BaseChatController
    {
        
        private readonly SqlQueryStore _sqlQueryStore;
        [HttpGet("{chatId:guid}")]
        public async Task<IActionResult> GetParticipants(Guid chatId)
        {
            var result = await userChatService.GetParticipantsAsync(chatId);
            return Ok(new ApiResponse<List<UserChatDto>> // ← correct type from interface
            {
                Data = result,           // ← use actual result not hardcoded string
                Queries = _sqlQueryStore.GetAll().ToList()
            });
        }

        [HttpGet("{chatId:guid}/{userId:guid}")]
        public async Task<IActionResult> IsParticipant(Guid chatId, Guid userId)
        {
            var result = await userChatService.IsParticipantAsync(chatId, userId);
            return Ok(new ApiResponse<bool> // ← correct type from interface
            {
                Data = result,
                Queries = _sqlQueryStore.GetAll().ToList()
            });
        }
    }
}
