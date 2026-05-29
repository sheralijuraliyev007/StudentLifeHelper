namespace StudentLifeHelper.Data.Entities.InfoEntities
{
    [Table("info_region",Schema =  "info")]
    [Index(nameof(StateCode),Name = "ix_info_region_state_code")]
    public class Region : BaseInfoEntity
    {

        [InverseProperty(nameof(User.Region))]
        public virtual List<User>? Users  { get; set; }

        [InverseProperty(nameof(RoomPost.Region))]
        public virtual List<RoomPost>? RoomPosts { get; set; }

        [Required]
        [Column("country_code")]
        public int CountryCode { get; set; }

        [ForeignKey(nameof(CountryCode))]
        public virtual Country? Country { get; set; }
    }
}
