namespace StudentLifeHelper.Data.Entities.MainEntities
{
    [Table("room_posts")]
    
    [Index(nameof(StatusCode),nameof(RegionCode),nameof(RoomTypeCode),Name = "ix_room_posts_search")]
    [Index(nameof(RoomTypeCode),Name = "ix_room_posts_room_type_code")]
    [Index(nameof(StatusCode),Name = "ix_room_posts_status_code")]
    [Index(nameof(UserId),Name = "ix_room_posts_user_id")]
    [Index(nameof(ForGenderCode),Name = "ix_room_posts_for_gender_code")]
    [Index(nameof(RegionCode),Name = "ix_room_posts_region_code")]
    [Index(nameof(RoomPostTypeCode),Name = "ix_room_posts_room_post_type_code")]
    [Index(nameof(CurrencyCode),Name = "ix_room_posts_currency_code")]
    [Index(nameof(RoomTypeCode),nameof(ForGenderCode),Name = "ix_room_posts_type_gender")]
    [Index(nameof(StatusCode),nameof(RoomTypeCode),Name = "ix_room_posts_status_type")]

    public class RoomPost : BaseCommonEntity
    {
        [Required]
        [Key]
        [Column("id")]
        public long Id { get; set; }


        [Required]
        [Column("room_post_type_code")]
        public int RoomPostTypeCode { get; set; }

        [ForeignKey(nameof(RoomPostTypeCode))]
        public virtual RoomPostType? RoomPostType { get; set; } 


        [Required]
        [Column("room_type_code")]
        public int RoomTypeCode { get; set; }


        [ForeignKey(nameof(RoomTypeCode))]
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
        [Column("room_capacity_count")]
        public int RoomCapacityCount { get; set; }
        
        
        [Column("for_gender_code")]
        public int? ForGenderCode { get; set; }

        [ForeignKey(nameof(ForGenderCode))]
        public virtual Gender? ForGender { get; set; }


        [Required]
        [Column("monthly_rent_fee", TypeName = "numeric(18,2)")]
        public decimal MonthlyRentFee { get; set; }


        [Required]
        [Column("currency_code")]
        public int CurrencyCode { get; set; }


        [ForeignKey(nameof(CurrencyCode))]
        public virtual CurrencyType? CurrencyType { get; set; }


        
        [Column("deposit_amount", TypeName = "numeric(18,2)")]
        public decimal? DepositAmount { get; set; }

        [Required]
        [Column("deposit_exists")]
        public bool DepositExists { get; set; }

        [Required]
        [Column("status_code")]
        public int StatusCode { get; set; }

        [ForeignKey(nameof(StatusCode))]
        public virtual Status? Status { get; set; }

        [Required]
        [Column("region_code")]
        public int RegionCode { get; set; }

        [ForeignKey(nameof(RegionCode))]
        public virtual Region? Region { get; set; }


        [Required]
        [Column("address_link")]
        public string AddressLink { get; set; } = string.Empty!;


        [InverseProperty(nameof(RoomPostContent.RoomPost))]
        public virtual List<RoomPostContent>? RoomPostContents { get; set; }
    }
}
