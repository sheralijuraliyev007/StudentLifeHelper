using Microsoft.AspNetCore.SignalR;
using StudentLifeHelper.Common.Dtos.Chat;
using StudentLifeHelper.Service.Chat.Interfaces;

namespace StudentLifeHelper.Api.Hubs
{
    public class ChatNotificationService(IHubContext<ChatHub, IChatHub> hubContext)
            : IChatNotificationService
    {
        public Task SendMessageAsync(Guid userId, MessageDto message) =>
            hubContext.Clients.Group(userId.ToString()).ReceiveMessage(message);

        public Task MessageEditedAsync(Guid userId, MessageDto message) =>
            hubContext.Clients.Group(userId.ToString()).MessageEdited(message);

        public Task MessageDeletedAsync(Guid userId, long messageId, Guid chatId) =>
            hubContext.Clients.Group(userId.ToString()).MessageDeleted(messageId, chatId);

        public Task ChatCreatedAsync(Guid userId, ChatDto chat) =>
            hubContext.Clients.Group(userId.ToString()).ChatCreated(chat);
    }
}
