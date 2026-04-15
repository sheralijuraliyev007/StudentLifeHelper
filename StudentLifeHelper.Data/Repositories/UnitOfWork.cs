using Microsoft.EntityFrameworkCore.Storage;
using StudentLifeHelper.Data.Context;
using StudentLifeHelper.Data.Entities.InfoEntities;
using StudentLifeHelper.Data.Entities.MainEntities;
using StudentLifeHelper.Data.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Data.Repositories
{
    public class UnitOfWork(
        AppDbContext context,
        IBaseRepository<ContentType> contentTypeRepository,
        IBaseRepository<Country> countryRepository,
        IBaseRepository<CurrencyType> currencyTypeRepository,
        IBaseRepository<Gender> genderRepository,
        IBaseRepository<InfoTable> infoTableRepository,
        IBaseRepository<Region> regionRepository,
        IBaseRepository<Role> roleRepository,
        IBaseRepository<RoomPostType> roomPostTypeRepository,
        IBaseRepository<RoomType> roomTypeRepository,
        IBaseRepository<State> stateRepository,
        IBaseRepository<Status> statusRepository,
        IBaseRepository<Chat> chatRepository,
        IBaseRepository<Content> contentRepository,
        IBaseRepository<CurrencyPost> currencyPostRepository,
        IBaseRepository<Message> messageRepository,
        IBaseRepository<RoomPost> roomPostRepository,
        IBaseRepository<RoomPostContent> roomPostContentRepository,
        IBaseRepository<User> userRepository,
        IBaseRepository<UserChat> userChatRepository,
        IBaseRepository<Language> languageRepository,
        IBaseRepository<Translation> translationRepository) 
        : IUnitOfWork
    {
        public IBaseRepository<ContentType> ContentTypeRepository() =>
            contentTypeRepository ?? new BaseRepository<ContentType>(context);
        public IBaseRepository<Country> CountryRepistory() =>
            countryRepository ?? new BaseRepository<Country>(context);
        public IBaseRepository<CurrencyType> CurrencyTypeRepository() =>
            currencyTypeRepository ?? new BaseRepository<CurrencyType>(context);
        public IBaseRepository<Gender> GenderRepository() =>
            genderRepository ?? new BaseRepository<Gender>(context);
        public IBaseRepository<InfoTable> InfoTableRepository() =>
            infoTableRepository ?? new BaseRepository<InfoTable>(context);
        public IBaseRepository<Region> RegionRepository() =>
            regionRepository ?? new BaseRepository<Region>(context);
        public IBaseRepository<Role> RoleRepository() =>
            roleRepository ?? new BaseRepository<Role>(context);
        public IBaseRepository<RoomPostType> RoomPostTypeRepository() =>
            roomPostTypeRepository ?? new BaseRepository<RoomPostType>(context);
        public IBaseRepository<RoomType> RoomTypeRepository() =>
            roomTypeRepository ?? new BaseRepository<RoomType>(context);
        public IBaseRepository<State> StateRepository() =>
            stateRepository ?? new BaseRepository<State>(context);
        public IBaseRepository<Status> StatusRepository() =>
            statusRepository ?? new BaseRepository<Status>(context);
        public IBaseRepository<Chat> ChatRepository() =>
            chatRepository ?? new BaseRepository<Chat>(context);
        public IBaseRepository<Content> ContentRepository() =>
            contentRepository ?? new BaseRepository<Content>(context);
        public IBaseRepository<CurrencyPost> CurrencyPostRepository() =>
            currencyPostRepository ?? new BaseRepository<CurrencyPost>(context);
        public IBaseRepository<Message> MessageRepository() =>
            messageRepository ?? new BaseRepository<Message>(context);
        public IBaseRepository<RoomPost> RoomPostRepository() =>
            roomPostRepository ?? new BaseRepository<RoomPost>(context);
        public IBaseRepository<RoomPostContent> RoomPostContentRepository() =>
            roomPostContentRepository ?? new BaseRepository<RoomPostContent>(context);
        public IBaseRepository<User> UserRepository() =>
            userRepository ?? new BaseRepository<User>(context);
        public IBaseRepository<UserChat> UserChatRepository() =>
            userChatRepository ?? new BaseRepository<UserChat>(context);

        public IBaseRepository<Language> LanguageRepository() =>
            languageRepository ?? new BaseRepository<Language>(context);

        public IBaseRepository<Translation> TranslationRepository() =>
            translationRepository ?? new BaseRepository<Translation>(context);

        public IBaseRepository<Country> CountryRepository() =>
        
            countryRepository ?? new BaseRepository<Country>(context);
        

        public async Task SaveChanges() => await context.SaveChangesAsync();

        public IDbContextTransaction BeginTransaction() => context.Database.BeginTransaction();
        public IDbContextTransaction? CurrentTransaction() => context.Database.CurrentTransaction;




    }
}
