using StudentLifeHelper.Common.Dtos.Chat;

namespace StudentLifeHelper.Service.Chat.Interfaces
{
    public interface IChatHub
    {
        Task ReceiveMessage(MessageDto message);
        Task MessageEdited(MessageDto message);
        Task MessageDeleted(long messageId, Guid chatId);
        Task ChatCreated(ChatDto chat);
    }
}
