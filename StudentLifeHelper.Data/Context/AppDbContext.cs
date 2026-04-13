using Microsoft.EntityFrameworkCore;
using StudentLifeHelper.Data.Entities.InfoEntities;
using StudentLifeHelper.Data.Entities.MainEntities;

namespace StudentLifeHelper.Data.Context
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        public DbSet<ContentType> ContentTypes { get; set; }
        public DbSet<Country> Countries { get; set; }
        public DbSet<CurrencyType> CurrencyTypes { get; set; }
        public DbSet<Gender> Genders { get; set; } 
        public DbSet<InfoTable> InfoTables { get; set; }
        public DbSet<Region> Regions{ get; set; }
        public DbSet<Role> Roles{ get; set; } 
        public DbSet<RoomPostType> RoomPostTypes{ get; set; }
        public DbSet<RoomType> RoomTypes{ get; set; } 
        public DbSet<State> States{ get; set; } 
        public DbSet<Status> Status{ get; set; } 
        public DbSet<Chat> Chats{ get; set; } 
        public DbSet<Content> Contents{ get; set; } 
        public DbSet<CurrencyPost> CurrencyPosts{ get; set; } 
        public DbSet<Message> Messages{ get; set; } 
        public DbSet<RoomPost> RoomPosts{ get; set; } 
        public DbSet<RoomPostContent> RoomPostContents{ get; set; } 
        public DbSet<User> Users{ get; set; }
        public DbSet<UserChat> UserChats{ get; set; }

        public DbSet<Language> Languages{ get; set; }

        public DbSet<Translation> Translations{ get; set; }

    }
}
