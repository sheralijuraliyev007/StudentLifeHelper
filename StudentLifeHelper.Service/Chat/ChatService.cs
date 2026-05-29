using StudentLifeHelper.Common.Dtos.Chat;
using StudentLifeHelper.Service.Chat.Interfaces;
using StudentLifeHelper.Service.Chat.QueryObjects;
using Microsoft.AspNetCore.SignalR;

namespace StudentLifeHelper.Service.Chat
{
    public class ChatService(IUnitOfWork unitOfWork,
    IUserHelper userHelper, IChatNotificationService notificationService) : StatusGenericHandler,IChatService
    {
        public async Task<bool> DeleteMessageAsync(long messageId)
        {
            var currentUserId = userHelper.GetUserId()!.Value;

            var message = await unitOfWork.MessageRepository()
                .GetAll()
                .FirstOrDefaultAsync(m => m.Id == messageId);

            if (message == null)
            {
                AddError("Message not found");
                return false;
            }

            if (message.FromUserId != currentUserId)
            {
                AddError("You can only delete your own messages");
                return false;
            }

            if (message.StatusCode == StatusConstants.DeletedStatusCode)
            {
                AddError("Message is already deleted");
                return false;
            }

            message.StatusCode = StatusConstants.DeletedStatusCode;
            message.ModifiedUserId = currentUserId;

            await unitOfWork.MessageRepository().Update(message);
            await unitOfWork.SaveChanges();

            var otherParticipant = await unitOfWork.UserChatRepository()
                .GetAll()
                .Where(uc => uc.ChatId == message.ChatId && uc.UserId != currentUserId)
                .Select(uc => uc.UserId)
                .FirstOrDefaultAsync();

            await notificationService.MessageDeletedAsync(currentUserId, messageId, message.ChatId);
            if (otherParticipant != Guid.Empty)
                await notificationService.MessageDeletedAsync(otherParticipant, messageId, message.ChatId);

            return true;

            
        }

        public async Task<MessageDto?> EditMessageAsync(long messageId, string newMessageText)
        {
            var currentUserId = userHelper.GetUserId()!.Value;

            var message = await unitOfWork.MessageRepository()
                .GetAll(m => m.FromUser!, m => m.Status!)
                .Include(m => m.ReplyToMessage!).ThenInclude(r => r.FromUser)
                .FirstOrDefaultAsync(m => m.Id == messageId);

            if (message == null)
            {
                AddError("Message not found");
                return null;
            }

            if (message.FromUserId != currentUserId)
            {
                AddError("You can only edit your own messages");
                return null;
            }

            if (message.StatusCode == StatusConstants.DeletedStatusCode)
            {
                AddError("Cannot edit a deleted message");
                return null;
            }

            message.MessageText = newMessageText;
            message.StatusCode = StatusConstants.UpdatedStatusCode;
            message.ModifiedUserId = currentUserId;

            await unitOfWork.MessageRepository().Update(message);
            await unitOfWork.SaveChanges();

            var config = GetCustomConfig();
            var dto = message.MapToDto<Message, MessageDto>(config);
            var otherParticipant = await unitOfWork.UserChatRepository()
                .GetAll()
                .Where(uc => uc.ChatId == message.ChatId && uc.UserId != currentUserId)
                .Select(uc => uc.UserId)
                .FirstOrDefaultAsync();

            await notificationService.MessageEditedAsync(currentUserId, dto);
            if (otherParticipant != Guid.Empty)
                await notificationService.MessageEditedAsync(otherParticipant, dto);

            return dto;
        }

        public async Task<ChatDto?> GetChatByIdAsync(Guid chatId)
        {
            var currentUserId = userHelper.GetUserId()!.Value;

            var userChat = await unitOfWork.UserChatRepository()
                .GetAll()
                .Include(uc => uc.Chat!).ThenInclude(c => c.Status)
                .Include(uc => uc.Chat!.UserChats!).ThenInclude(p => p.User!)
                    .ThenInclude(u => u.Img)
                .Include(uc => uc.Chat!.Messages!
                    .Where(m => m.StatusCode != StatusConstants.DeletedStatusCode)
                    .OrderByDescending(m => m.CreatedDateTime)
                    .Take(1))
                .Where(uc => uc.ChatId == chatId && uc.UserId == currentUserId)
                .FirstOrDefaultAsync();

            if (userChat == null)
            {
                AddError("Chat not found or you are not a participant");
                return null;
            }

            return MapToChatDto(userChat, currentUserId);
        }

        public async Task<PaginationModel<MessageDto>> GetMessagesAsync(Guid chatId, MessageFilterOptions filterOptions)
        {
            var currentUserId = userHelper.GetUserId()!.Value;

            var isParticipant = await unitOfWork.UserChatRepository()
                .GetAll()
                .AnyAsync(uc => uc.ChatId == chatId && uc.UserId == currentUserId);

            if (!isParticipant)
            {
                AddError("You are not a participant of this chat");
                return new PaginationModel<MessageDto>();
            }

            var config = GetCustomConfig();

            var query = unitOfWork.MessageRepository()
                .GetAll(m => m.FromUser!, m => m.Status!)
                .Include(m => m.ReplyToMessage!).ThenInclude(r => r.FromUser)
                .ApplyFilter(filterOptions, chatId);

            return query
                .MapToDtos<Message, MessageDto>(config)
                .ToPaginationModel(filterOptions.Page, filterOptions.PageSize);
        }

        public async Task<PaginationModel<ChatDto>> GetMyChatsAsync(ChatFilterOptions filterOptions)
        {
            var currentUserId = userHelper.GetUserId()!.Value;

            var userChats = await unitOfWork.UserChatRepository()
                .GetAll()
                .Include(uc => uc.Chat!).ThenInclude(c => c.Status)
                .Include(uc => uc.Chat!.UserChats!).ThenInclude(p => p.User!)
                    .ThenInclude(u => u.Img)
                .Include(uc => uc.Chat!.Messages!
                    .Where(m => m.StatusCode != StatusConstants.DeletedStatusCode)
                    .OrderByDescending(m => m.CreatedDateTime)
                    .Take(1))
                .ApplyFilter(filterOptions, currentUserId)
                .ToListAsync();

            var dtos = userChats
                .Select(uc => MapToChatDto(uc, currentUserId))
                .AsQueryable(); // ← fix

            return dtos.ToPaginationModel(filterOptions.Page, filterOptions.PageSize);
        }

        public async Task<ChatDto?> GetOrCreateChatAsync(Guid targetUserId)
        {
            var currentUserId = userHelper.GetUserId()!.Value;

            var existingChat = await unitOfWork.ChatRepository()
                .GetAll(c => c.UserChats!)
                .Where(c =>
                    c.UserChats!.Any(uc => uc.UserId == currentUserId) &&
                    c.UserChats!.Any(uc => uc.UserId == targetUserId) &&
                    c.UserChats!.Count == 2)
                .FirstOrDefaultAsync();

            if (existingChat != null)
            {
                return await GetChatByIdAsync(existingChat.Id);
            }

            var chat = new Data.Entities.MainEntities.Chat
            {
                Id = Guid.NewGuid(),
                StatusCode = StatusConstants.ActiveStatusCode,
                CreatedUserId = currentUserId,
            };

            await unitOfWork.ChatRepository().Add(chat);

            var userChat1 = new UserChat
            {
                UserId = currentUserId,
                ChatId = chat.Id,
                CreatedUserId = currentUserId,
                StatusCode = StatusConstants.ActiveStatusCode,
            };

            var userChat2 = new UserChat
            {
                UserId = targetUserId,
                ChatId = chat.Id,
                StatusCode = StatusConstants.ActiveStatusCode,
                CreatedUserId = currentUserId
            };

            await unitOfWork.UserChatRepository().Add(userChat1);
            await unitOfWork.UserChatRepository().Add(userChat2);
            await unitOfWork.SaveChanges();

            var chatDto = await GetChatByIdAsync(chat.Id);

            if (chatDto != null)
                await notificationService.ChatCreatedAsync(targetUserId, chatDto);

            return chatDto;
        }

        public async Task MarkAsReadAsync(Guid chatId)
        {
            var currentUserId = userHelper.GetUserId()!.Value;

            var unreadMessages = await unitOfWork.MessageRepository()
                .GetAll()
                .Where(m => m.ChatId == chatId
                         && m.FromUserId != currentUserId
                         && m.ReadAt == null
                         && m.StatusCode != StatusConstants.DeletedStatusCode)
                .ToListAsync();

            foreach (var msg in unreadMessages)
            {
                msg.ReadAt = DateTime.UtcNow;
                await unitOfWork.MessageRepository().Update(msg);
            }

            await unitOfWork.SaveChanges();
        }
        public async Task<MessageDto?> SendMessageAsync(Guid chatId, string messageText, long? replyToMessageId)
        {
            var currentUserId = userHelper.GetUserId()!.Value;

            var isParticipant = await unitOfWork.UserChatRepository()
                .GetAll()
                .AnyAsync(uc => uc.ChatId == chatId && uc.UserId == currentUserId);

            if (!isParticipant)
            {
                AddError("You are not a participant of this chat");
                return null;
            }

            var message = new Message
            {
                ChatId = chatId,
                FromUserId = currentUserId,
                MessageText = messageText,
                ReplyToMessageId = replyToMessageId,
                StatusCode = StatusConstants.ActiveStatusCode,
                CreatedUserId = currentUserId,
            };

            await unitOfWork.MessageRepository().Add(message);
            await unitOfWork.SaveChanges();

            // Reload with includes for DTO mapping
            var saved = await unitOfWork.MessageRepository()
                .GetAll(m => m.FromUser!, m => m.Status!)
                .Include(m => m.ReplyToMessage!).ThenInclude(r => r.FromUser)
                .FirstOrDefaultAsync(m => m.Id == message.Id);

            var config = GetCustomConfig();
            var dto = saved!.MapToDto<Message, MessageDto>(config);
            var otherParticipant = await unitOfWork.UserChatRepository()
                 .GetAll()
                .Where(uc => uc.ChatId == chatId && uc.UserId != currentUserId)
                .Select(uc => uc.UserId)
                .FirstOrDefaultAsync();

            await notificationService.SendMessageAsync(currentUserId, dto);
            if (otherParticipant != Guid.Empty)
                await notificationService.SendMessageAsync(otherParticipant, dto);

            return dto;
        }

        private static TypeAdapterConfig GetCustomConfig()
        {
            var config = new TypeAdapterConfig();

            config.NewConfig<Message, MessageDto>()
                .Map(dest => dest.FromUsername, src => src.FromUser!.Username)
                .Map(dest => dest.StatusName, src => src.Status!.FullName)
                .Map(dest => dest.IsDeleted, src => src.StatusCode == StatusConstants.DeletedStatusCode)
                .Map(dest => dest.MessageText,
                    src => src.StatusCode == StatusConstants.DeletedStatusCode ? null : src.MessageText)
                .Map(dest => dest.ReplyToMessageText,
                    src => src.ReplyToMessage != null
                        ? (src.ReplyToMessage.StatusCode == StatusConstants.DeletedStatusCode
                            ? null : src.ReplyToMessage.MessageText)
                        : null)
                .Map(dest => dest.ReplyToUsername,
                    src => src.ReplyToMessage != null
                        ? src.ReplyToMessage.FromUser!.Username : null)
                .Map(dest => dest.ReplyToIsDeleted,
                    src => src.ReplyToMessage != null &&
                           src.ReplyToMessage.StatusCode == StatusConstants.DeletedStatusCode);

            config.NewConfig<Data.Entities.MainEntities.Chat, ChatDto>()
                .Map(dest => dest.StatusName, src => src.Status!.FullName);

            config.NewConfig<UserChat, UserChatDto>()
                .Map(dest => dest.Username, src => src.User!.Username)
                .Map(dest => dest.StatusName, src => src.Status!.FullName)
                .Map(dest => dest.ProfileImageUrl,
                    src => src.User!.Img != null ? src.User.Img.FileId.GetFileUrl() : null);

            return config;
        }

        private ChatDto MapToChatDto(UserChat userChat, Guid currentUserId)
        {
            var otherParticipant = userChat.Chat!.UserChats!
                .FirstOrDefault(uc => uc.UserId != currentUserId);

            var lastMessage = userChat.Chat.Messages?
                .OrderByDescending(m => m.CreatedDateTime)
                .FirstOrDefault();

            return new ChatDto
            {
                Id = userChat.ChatId,
                StatusCode = userChat.Chat.StatusCode,
                StatusName = userChat.Chat.Status?.FullName ?? string.Empty,
                OtherUserId = otherParticipant?.UserId ?? Guid.Empty,
                OtherUsername = otherParticipant?.User?.Username ?? string.Empty,
                OtherUserProfileImageUrl = otherParticipant?.User?.Img != null
                    ? otherParticipant.User.Img.FileId.GetFileUrl()
                    : null,
                LastMessageText = lastMessage?.MessageText,
                LastMessageAt = lastMessage?.CreatedDateTime,
                LastMessageFromUserId = lastMessage?.FromUserId,
                UnreadCount = userChat.Chat.Messages?
                    .Count(m => m.FromUserId != currentUserId && m.ReadAt == null) ?? 0
            };
        }
    }
}
