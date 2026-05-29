namespace StudentLifeHelper.Data.Entities.InfoEntities
{

    [Table("info_gender",Schema =  "info")]
    [Index(nameof(StateCode),Name = "ix_info_gender_state_code")]
    public class Gender: BaseInfoEntity
    {


        [InverseProperty(nameof(User.Gender))]
        public virtual List<User>? Users { get; set; }

        [InverseProperty(nameof(RoomPost.ForGender))]
        public virtual List<RoomPost>? ForGenderRoomPosts { get; set; }

    }
}
