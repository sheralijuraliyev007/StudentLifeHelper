using StudentLifeHelper.Common.Dtos.Chat;
using StudentLifeHelper.Service.Chat.Interfaces;

namespace StudentLifeHelper.Service.Chat
{
    public class UserChatService(IUnitOfWork unitOfWork) : IUserChatService
    {
        public async Task<List<UserChatDto>> GetParticipantsAsync(Guid chatId)
        {
            var config = new TypeAdapterConfig();
            config.NewConfig<UserChat, UserChatDto>()
                .Map(dest => dest.Username, src => src.User!.Username)
                .Map(dest => dest.StatusName, src => src.Status!.FullName)
                .Map(dest => dest.ProfileImageUrl,
                    src => src.User!.Img != null
                        ? src.User.Img.FileId.GetFileUrl()
                        : null);

            return await unitOfWork.UserChatRepository()
        .GetAll(uc => uc.User!, uc => uc.Status!)
        .Include(uc => uc.User!.Img)
        .Where(uc => uc.ChatId == chatId)
        .ProjectToType<UserChatDto>(config)
        .ToListAsync();
        }

        public async Task<bool> IsParticipantAsync(Guid chatId, Guid userId)
        {
            return await unitOfWork.UserChatRepository()
                .GetAll()
                .AnyAsync(uc => uc.ChatId == chatId && uc.UserId == userId);
        }
    }
}
