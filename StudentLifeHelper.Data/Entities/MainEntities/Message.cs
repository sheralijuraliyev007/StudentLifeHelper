using Microsoft.EntityFrameworkCore;
using StudentLifeHelper.Data.Entities.BaseEntities;
using StudentLifeHelper.Data.Entities.InfoEntities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace StudentLifeHelper.Data.Entities.MainEntities
{

    [Table("messages")]
    [Index(nameof(StatusId), Name = "ix_messages_status_id")]
    [Index(nameof(ChatId), Name = "ix_messages_chat_id")]
    [Index(nameof(FromUserId), Name = "ix_messages_from_user_id")]
    [Index(nameof(ReplyToMessageId), Name = "ix_messages_reply_to_message_id")]
    [Index(nameof(ChatId), nameof(StatusId), Name = "ix_messages_chat_status")]
    [Index(nameof(ChatId), nameof(CreatedDateTime), Name = "ix_messages_chat_id_created_date_time")]

    public class Message : BaseCommonEntity
    {
        [Key]
        [Required]
        [Column("id")]
        public long Id { get; set; }

        [Required]
        [Column("from_user_id")]
        public Guid FromUserId { get; set; }


        [ForeignKey(nameof(FromUserId))]
        public virtual User? FromUser { get; set; }


        [Required]
        [Column("chat_id")]
        public Guid ChatId { get; set; }

        [ForeignKey(nameof(ChatId))]
        public virtual Chat? Chat { get; set; }


        [Required]
        [Column("status_id")]
        public int StatusId { get; set; }


        [ForeignKey(nameof(StatusId))]
        public virtual Status? Status { get; set; }


        [Column("message_text")]
        [MaxLength(4000)]
        [Required]
        public string MessageText { get; set; } = string.Empty!;


        [Column("reply_to_message_id")]
        public long? ReplyToMessageId { get; set; }


        [ForeignKey(nameof(ReplyToMessageId))]
        public virtual Message? ReplyToMessage { get; set; }


        [InverseProperty(nameof(Message.ReplyToMessage))]
        public virtual List<Message> Replies { get; set; } = new();

    }
}
