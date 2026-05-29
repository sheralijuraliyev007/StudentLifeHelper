namespace StudentLifeHelper.Api.Controllers.Chat
{
    public class ChatController(IChatService chatService, SqlQueryStore sqlQueryStore): BaseChatController
    {
        private readonly SqlQueryStore _sqlQueryStore = sqlQueryStore;
        [HttpPost]
        public async Task<IActionResult> GetMyChats([FromBody] ChatFilterOptions filterOptions)
        {
            var result = await chatService.GetMyChatsAsync(filterOptions);
            if (chatService.IsValid)
                return Ok(new ApiResponse<PaginationModel<ChatDto>>
                {
                    Data = result,
                    Queries = _sqlQueryStore.GetAll().ToList()
                });
            return BadRequest(chatService.Errors);
        }

        [HttpGet("{chatId:guid}")]
        public async Task<IActionResult> GetChatById(Guid chatId)
        {
            var result = await chatService.GetChatByIdAsync(chatId);
            if (chatService.IsValid)
                return Ok(new ApiResponse<ChatDto?>
                {
                    Data = result,
                    Queries = _sqlQueryStore.GetAll().ToList()
                });
            return BadRequest(chatService.Errors);
        }

        [HttpPost]
        public async Task<IActionResult> GetOrCreateChat(Guid targetUserId)
        {
            var result = await chatService.GetOrCreateChatAsync(targetUserId);
            if (chatService.IsValid)
                return Ok(new ApiResponse<ChatDto?>
                {
                    Data = result,
                    Queries = _sqlQueryStore.GetAll().ToList()
                });
            return BadRequest(chatService.Errors);
        }

        [HttpPost("{chatId:guid}/messages")]
        public async Task<IActionResult> GetMessages(Guid chatId, [FromBody] MessageFilterOptions filterOptions)
        {
            var result = await chatService.GetMessagesAsync(chatId, filterOptions);
            if (chatService.IsValid)
                return Ok(new ApiResponse<PaginationModel<MessageDto>>
                {
                    Data = result,
                    Queries = _sqlQueryStore.GetAll().ToList()
                });
            return BadRequest(chatService.Errors);
        }

        [HttpPost]
        public async Task<IActionResult> SendMessage(Guid chatId, string messageText, long? replyToMessageId = null)
        {
            var result = await chatService.SendMessageAsync(chatId, messageText, replyToMessageId);
            if (chatService.IsValid)
                return Ok(new ApiResponse<MessageDto?>
                {
                    Data = result,
                    Queries = _sqlQueryStore.GetAll().ToList()
                });
            return BadRequest(chatService.Errors);
        }

        [HttpPut("{messageId:long}")]
        public async Task<IActionResult> EditMessage(long messageId, string newMessageText)
        {
            var result = await chatService.EditMessageAsync(messageId, newMessageText);
            if (chatService.IsValid)
                return Ok(new ApiResponse<MessageDto?>
                {
                    Data = result,
                    Queries = _sqlQueryStore.GetAll().ToList()
                });
            return BadRequest(chatService.Errors);
        }

        [HttpDelete("{messageId:long}")]
        public async Task<IActionResult> DeleteMessage(long messageId)
        {
            var result = await chatService.DeleteMessageAsync(messageId);
            if (chatService.IsValid)
                return Ok(new ApiResponse<bool>
                {
                    Data = result,
                    Queries = _sqlQueryStore.GetAll().ToList()
                });
            return BadRequest(chatService.Errors);
        }

        [HttpPost("{chatId:guid}/mark-as-read")]
        public async Task<IActionResult> MarkAsRead(Guid chatId)
        {
            await chatService.MarkAsReadAsync(chatId);
            if (chatService.IsValid)
                return Ok(new ApiResponse<string?>
                {
                    Data = "Messages marked as read",
                    Queries = _sqlQueryStore.GetAll().ToList()
                });
            return BadRequest(chatService.Errors);
        }
    }
}
