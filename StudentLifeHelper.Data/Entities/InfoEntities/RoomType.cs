namespace StudentLifeHelper.Data.Entities.InfoEntities
{
    [Table("info_room_type",Schema =  "info")]
    [Index(nameof(StateCode), Name = "ix_info_room_type_state_code")]
    public class RoomType:BaseInfoEntity
    {

        [InverseProperty(nameof(RoomPost.RoomType))]
        public virtual List<RoomPost>? RoomPosts { get; set; }
    }
}
