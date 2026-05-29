namespace StudentLifeHelper.Data.Entities.InfoEntities
{
    [Table("info_room_post_type",Schema =  "info")]
    [Index(nameof(StateCode), Name = "ix_info_room_post_type_state_code")]

    public class RoomPostType : BaseInfoEntity
    {

        [InverseProperty(nameof(RoomPost.RoomPostType))]
        public virtual List<RoomPost>? RoomPosts { get; set; }
    }
}
