using Microsoft.EntityFrameworkCore;
using StudentLifeHelper.Data.Entities.BaseEntities;
using StudentLifeHelper.Data.Entities.InfoEntities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Data.Entities.MainEntities
{
    [Table("users")]
    [Index(nameof(CountryId), Name = "ix_users_country_id")]
    [Index(nameof(StateId), Name = "ix_users_state_id")]
    [Index(nameof(RoleId), Name = "ix_users_role_id")]
    [Index(nameof(ImgId), Name = "ix_users_img_id")]
    [Index(nameof(GenderId), Name = "ix_users_gender_id")]
    
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
        [Column("country_id")]
        public int CountryId { get; set; }

        [ForeignKey(nameof(CountryId))]
        public virtual Country? Country { get; set; }

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

        [Column("state_id")]
        [Required]
        public int StateId { get; set; }

        [ForeignKey(nameof(StateId))]
        public virtual State? State { get; set; }


        [Required]
        [Column("role_id")]
        public int RoleId { get; set; }

        [ForeignKey(nameof(RoleId))]
        public virtual Role? Role { get; set; }


        [Column("refresh_token")]
        public string? RefreshToken { get; set; }


        [Column("refresh_token_expiry_time")]
        [Required]
        public DateTimeOffset RefreshTokenExpireTime { get; set; }



        [Column("img_id")]
        public long? ImgId { get; set; }

        [ForeignKey(nameof(ImgId))]
        public virtual Content? Img { get; set; }


        [Column("gender_id")]
        [Required]
        public int GenderId { get; set; }

        [ForeignKey(nameof(GenderId))]
        public virtual Gender? Gender { get; set; }


        [Required]
        [Column("region_id")]
        public int RegionId { get; set; }

        [ForeignKey(nameof(RegionId))]
        public virtual Region? Region { get; set; }

    }
}
