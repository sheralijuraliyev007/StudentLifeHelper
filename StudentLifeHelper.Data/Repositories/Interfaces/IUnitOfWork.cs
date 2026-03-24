using Microsoft.EntityFrameworkCore.Storage;
using StudentLifeHelper.Data.Entities.InfoEntities;
using StudentLifeHelper.Data.Entities.MainEntities;

namespace StudentLifeHelper.Data.Repositories.Interfaces
{
    public interface IUnitOfWork
    {
        IBaseRepository<ContentType> ContentTypeRepository();
        IBaseRepository<Country> CountryRepository();
        IBaseRepository<CurrencyType> CurrencyTypeRepository();
        IBaseRepository<Gender> GenderRepository();
        IBaseRepository<InfoTable> InfoTableRepository();
        IBaseRepository<Region> RegionRepository();
        IBaseRepository<Role> RoleRepository();
        IBaseRepository<RoomPostType> RoomPostTypeRepository();
        IBaseRepository<RoomType> RoomTypeRepository();
        IBaseRepository<Status> StatusRepository();
        IBaseRepository<Chat> ChatRepository();
        IBaseRepository<Content> ContentRepository();
        IBaseRepository<CurrencyPost> CurrencyPostRepository();
        IBaseRepository<Message> MessageRepository();
        IBaseRepository<RoomPost> RoomPostRepository();
        IBaseRepository<RoomPostContent> RoomPostContentRepository();
        IBaseRepository<User> UserRepository();
        IBaseRepository<UserChat> UserChatRepository();

        Task SaveChanges();
        IDbContextTransaction BeginTransaction();
        IDbContextTransaction? CurrentTransaction();
    }
}
