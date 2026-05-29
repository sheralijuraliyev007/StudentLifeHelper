namespace StudentLifeHelper.Data.Entities.MainEntities
{

    [Table("chats")]
    [Index(nameof(StatusCode), Name = "ix_chats_status_code")]
    public class Chat : BaseCommonEntity
    {
        [Key]
        [Required]
        [Column("id")]
        public Guid Id { get; set; }


        [Required]
        [Column("status_code")]
        public int StatusCode { get; set; }


        [ForeignKey(nameof(StatusCode))]
        public virtual Status? Status { get; set; }

        [InverseProperty(nameof(UserChat.Chat))]
        public virtual List<UserChat>? UserChats { get; set; }

        [InverseProperty(nameof(Message.Chat))]
        public virtual List<Message>? Messages { get; set; }


    }
}
