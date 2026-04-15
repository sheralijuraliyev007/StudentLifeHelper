using Microsoft.EntityFrameworkCore;
using StudentLifeHelper.Data.Entities.BaseEntities;
using StudentLifeHelper.Data.Entities.InfoEntities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentLifeHelper.Data.Entities.MainEntities
{
    [Table("users")]
    [Index(nameof(BirthCountryCode), Name = "ix_users_birth_country_code")]
    [Index(nameof(ResidenceCountryCode), Name = "ix_users_residence_country_code")]
    [Index(nameof(BirthCountryCode),nameof(ResidenceCountryCode), Name = "ix_users_birth_residence_country_code")]
    [Index(nameof(StateCode), Name = "ix_users_state_code")]
    [Index(nameof(RoleCode), Name = "ix_users_role_code")]
    [Index(nameof(ImgId), Name = "ix_users_img_id")]
    [Index(nameof(GenderCode), Name = "ix_users_gender_code")]
    
    public class User : BaseCommonEntity
    {
        [Key]
        [Required]
        [Column("id")]
        public Guid Id { get; set; }

        [Required]
        [Column("first_name")]
        [MaxLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [Column("last_name")]
        [MaxLength(50)]
        public string LastName { get; set; } = string.Empty;


        
        [Column("middle_name")]
        [MaxLength(50)]
        public string? MiddleName{ get; set; }



        [Required]
        [Column("birth_country_code")]
        public int BirthCountryCode { get; set; }

        [ForeignKey(nameof(BirthCountryCode))]
        public virtual Country? BirthCountry { get; set; }


        [Required]
        [Column("residence_country_code")]
        public int ResidenceCountryCode { get; set; }

        [ForeignKey(nameof(ResidenceCountryCode))]
        public virtual Country? ResidenceCountry { get; set; }

        [Column("birth_date")]
        public DateTime? BirthDate { get; set; }

        [Column("password_hash")]
        [Required]
        [MaxLength(255)]
        public string PasswordHash { get; set; } = string.Empty;


        [Column("username")]
        [Required]
        [MaxLength(50)]
        public string Username { get; set; } = string.Empty;

        [Column("state_code")]
        [Required]
        public int StateCode { get; set; }

        [ForeignKey(nameof(StateCode))]
        public virtual State? State { get; set; }


        [Required]
        [Column("role_code")]
        public int RoleCode { get; set; }

        [ForeignKey(nameof(RoleCode))]
        public virtual Role? Role { get; set; }


        [Column("refresh_token")]
        public string? RefreshToken { get; set; }


        [Column("refresh_token_expiry_time")]
        [Required]
        public DateTimeOffset RefreshTokenExpireTime { get; set; }

        [Column("language_code")]
        [Required]
        public int LanguageCode { get; set; }

        [ForeignKey(nameof(LanguageCode))]
        public virtual Language? Language { get; set; }



        [Column("img_id")]
        public long? ImgId { get; set; }

        [ForeignKey(nameof(ImgId))]
        public virtual Content? Img { get; set; }


        [Column("gender_code")]
        [Required]
        public int GenderCode { get; set; }

        [ForeignKey(nameof(GenderCode))]
        public virtual Gender? Gender { get; set; }


        [Required]
        [Column("region_code")]
        public int RegionCode { get; set; }

        [ForeignKey(nameof(RegionCode))]
        public virtual Region? Region { get; set; }


        [InverseProperty(nameof(UserChat.User))]
        public virtual List<UserChat>? UserChats { get; set; }

        [InverseProperty(nameof(RoomPost.User))]
        public virtual List<RoomPost>? RoomPosts { get; set; }

        [InverseProperty(nameof(CurrencyPost.User))]
        public virtual List<CurrencyPost>? CurrencyPosts { get; set; }

        [InverseProperty(nameof(Message.FromUser))]
        public virtual List<Message>? Messages { get; set; }

    }
}
