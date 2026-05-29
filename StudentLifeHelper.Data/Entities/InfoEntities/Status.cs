namespace StudentLifeHelper.Data.Entities.InfoEntities
{
    [Table("info_status", Schema = "info")]
    [Index(nameof(StateCode), Name = "ix_info_status_state_code")]
    public class Status : BaseInfoEntity
    {
        [InverseProperty(nameof(Chat.Status))]
        public virtual List<Chat>? Chats { get; set; }


        [InverseProperty(nameof(CurrencyPost.Status))]
        public virtual List<CurrencyPost>? CurrencyPosts { get; set; }


        [InverseProperty(nameof(Message.Status))]
        public virtual List<Message>? Messages { get; set; }

        [InverseProperty(nameof(RoomPost.Status))]
        public virtual List<RoomPost>? RoomPosts { get; set; }

        [InverseProperty(nameof(UserChat.Status))]
        public virtual List<UserChat>? UserChats { get; set; }


    }

}
