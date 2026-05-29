using StudentLifeHelper.Common.Dtos.Chat;

namespace StudentLifeHelper.Service.Chat.Interfaces
{
    public interface IChatService : IStatusGeneric
    {
        Task<ChatDto?> GetOrCreateChatAsync(Guid targetUserId);

        // Get paginated list of chats for current user
        Task<PaginationModel<ChatDto>> GetMyChatsAsync(ChatFilterOptions filterOptions);

        // Get a single chat by id (validates current user is a participant)
        Task<ChatDto?> GetChatByIdAsync(Guid chatId);

        // Get paginated messages inside a chat
        Task<PaginationModel<MessageDto>> GetMessagesAsync(Guid chatId, MessageFilterOptions filterOptions);

        // Send a message
        Task<MessageDto?> SendMessageAsync(Guid chatId, string messageText, long? replyToMessageId);

        // Mark all unread messages in a chat as read
        Task MarkAsReadAsync(Guid chatId);

        Task<MessageDto?> EditMessageAsync(long messageId, string newMessageText);
        Task<bool> DeleteMessageAsync(long messageId);
    }
}
