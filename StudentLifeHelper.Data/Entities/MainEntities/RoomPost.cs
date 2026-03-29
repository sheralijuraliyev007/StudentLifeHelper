using Microsoft.EntityFrameworkCore;
using StudentLifeHelper.Data.Entities.BaseEntities;
using StudentLifeHelper.Data.Entities.InfoEntities;

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentLifeHelper.Data.Entities.MainEntities
{
    [Table("room_posts")]
    [Index(nameof(CreatedDateTime),Name = "ix_room_posts_active_feed")]
    [Index(nameof(StatusId),nameof(RoomTypeId),nameof(RegionId),Name = "ix_room_posts_search")]
    [Index(nameof(RoomTypeId),Name = "ix_room_posts_room_type_id")]
    [Index(nameof(StatusId),Name = "ix_room_posts_status_id")]
    [Index(nameof(UserId),Name = "ix_room_posts_user_id")]
    [Index(nameof(ForGenderId),Name = "ix_room_posts_for_gender_id")]
    [Index(nameof(RegionId),Name = "ix_room_posts_region_id")]
    [Index(nameof(RoomPostTypeId),Name = "ix_room_posts_room_post_type_id")]
    [Index(nameof(CurrencyId),Name = "ix_room_posts_currency_id")]
    [Index(nameof(RoomTypeId),nameof(ForGenderId),Name = "ix_room_posts_type_gender")]
    [Index(nameof(StatusId),nameof(RoomTypeId),Name = "ix_room_posts_status_type")]
    [Index(nameof(CreatedDateTime),Name = "ix_room_posts_created_date_time")]



    public class RoomPost : BaseCommonEntity
    {
        [Required]
        [Key]
        [Column("id")]
        public long Id { get; set; }


        [Required]
        [Column("room_post_type_id")]
        public int RoomPostTypeId { get; set; }

        [ForeignKey(nameof(RoomPostTypeId))]
        public virtual RoomPostType? RoomPostType { get; set; } 


        [Required]
        [Column("room_type_id")]
        public int RoomTypeId { get; set; }


        [ForeignKey(nameof (RoomTypeId))]
        public virtual RoomType? RoomType { get; set; }

        [Required]
        [Column("user_id")]
        public Guid UserId { get; set; }

        [ForeignKey(nameof(UserId))]
        public virtual User? User { get; set; }


        [Required]
        [Column("title")]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty!;


        [Required]
        [MaxLength(4000)]
        [Column("description")]
        public string Description { get; set; } = string.Empty!;

        [Required]
        [Column("for_gender_id")]
        public int ForGenderId { get; set; }


        [ForeignKey(nameof(ForGenderId))]
        public virtual Gender? Gender { get; set; }


        [Required]
        [Column("monthly_rent_fee")]
        public decimal MonthlyRentFee { get; set; }


        [Required]
        [Column("currency_id")]
        public int CurrencyId { get; set; }


        [ForeignKey(nameof(CurrencyId))]
        public virtual CurrencyType? CurrencyType { get; set; }


        [Required]
        [Column("deposit_amount")]
        public decimal DepositAmount { get; set; }

        [Required]
        [Column("status_id")]
        public int StatusId { get; set; }

        [ForeignKey(nameof(StatusId))]
        public virtual Status? Status { get; set; }

        [Required]
        [Column("region_id")]
        public int RegionId { get; set; }

        [ForeignKey(nameof(RegionId))]
        public virtual Region? Region { get; set; }


        [Required]
        [Column("address_link")]
        public string AddressLink { get; set; } = string.Empty!;


        [InverseProperty(nameof(RoomPostContent.RoomPost))]
        public virtual List<RoomPostContent> RoomPostContents { get; set; }
    }
}
