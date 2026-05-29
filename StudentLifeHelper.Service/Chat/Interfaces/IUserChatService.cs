using StudentLifeHelper.Common.Dtos.Chat;

namespace StudentLifeHelper.Service.Chat.Interfaces
{
    public interface IUserChatService
    {
        // Check if a user is a participant in a chat
        Task<bool> IsParticipantAsync(Guid chatId, Guid userId);

        // Get both participants of a chat
        Task<List<UserChatDto>> GetParticipantsAsync(Guid chatId);
    }
}
