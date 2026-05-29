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
        public DbSet<Region> Regions { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<RoomPostType> RoomPostTypes { get; set; }
        public DbSet<RoomType> RoomTypes { get; set; }
        public DbSet<State> States { get; set; }
        public DbSet<Status> Status { get; set; }
        public DbSet<Chat> Chats { get; set; }
        public DbSet<Content> Contents { get; set; }
        public DbSet<CurrencyPost> CurrencyPosts { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<RoomPost> RoomPosts { get; set; }
        public DbSet<RoomPostContent> RoomPostContents { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<UserChat> UserChats { get; set; }

        public DbSet<Language> Languages { get; set; }

        public DbSet<Translation> Translations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<RoomPost>()
                .HasIndex(x => x.CreatedDateTime)
                .HasDatabaseName("ix_room_posts_active_feed")
                .HasFilter("status_code = 2");

            modelBuilder.Entity<Status>()
                .HasAlternateKey(s => s.Code);

            modelBuilder.Entity<RoomPost>()
                .HasOne(r => r.Status)
                .WithMany(s => s.RoomPosts)
                .HasForeignKey(r => r.StatusCode)
                .HasPrincipalKey(s => s.Code);

            // Alternate keys
            modelBuilder.Entity<Region>().HasAlternateKey(r => r.Code);
            modelBuilder.Entity<Country>().HasAlternateKey(c => c.Code);
            modelBuilder.Entity<Gender>().HasAlternateKey(g => g.Code);
            modelBuilder.Entity<Role>().HasAlternateKey(r => r.Code);
            modelBuilder.Entity<State>().HasAlternateKey(s => s.Code);
            modelBuilder.Entity<Language>().HasAlternateKey(l => l.Code);

            // User relationships
            modelBuilder.Entity<User>()
                .HasOne(u => u.Region)
                .WithMany(r => r.Users)
                .HasForeignKey(u => u.RegionCode)
                .HasPrincipalKey(r => r.Code);

            modelBuilder.Entity<User>()
                .HasOne(u => u.BirthCountry)
                .WithMany(c => c.BirthUsers)
                .HasForeignKey(u => u.BirthCountryCode)
                .HasPrincipalKey(c => c.Code);

            modelBuilder.Entity<User>()
                .HasOne(u => u.ResidenceCountry)
                .WithMany(c => c.ResidenceUsers)
                .HasForeignKey(u => u.ResidenceCountryCode)
                .HasPrincipalKey(c => c.Code);

            modelBuilder.Entity<User>()
                .HasOne(u => u.Gender)
                .WithMany(g => g.Users)
                .HasForeignKey(u => u.GenderCode)
                .HasPrincipalKey(g => g.Code);

            modelBuilder.Entity<User>()
                .HasOne(u => u.Role)
                .WithMany(r => r.Users)
                .HasForeignKey(u => u.RoleCode)
                .HasPrincipalKey(r => r.Code);

            modelBuilder.Entity<User>()
                .HasOne(u => u.State)
                .WithMany()
                .HasForeignKey(u => u.StateCode)
                .HasPrincipalKey(s => s.Code);

            modelBuilder.Entity<User>()
                .HasOne(u => u.Language)
                .WithMany(l => l.Users)
                .HasForeignKey(u => u.LanguageCode)
                .HasPrincipalKey(l => l.Code);
        }

    }
}
