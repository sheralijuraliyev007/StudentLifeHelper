using StudentLifeHelper.Common.Dtos.Chat;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Service.Chat.Interfaces
{
    public interface IChatNotificationService
    {
        Task SendMessageAsync(Guid userId, MessageDto message);
        Task MessageEditedAsync(Guid userId, MessageDto message);
        Task MessageDeletedAsync(Guid userId, long messageId, Guid chatId);
        Task ChatCreatedAsync(Guid userId, ChatDto chat);
    }
}
