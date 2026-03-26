using Microsoft.EntityFrameworkCore;
using StudentLifeHelper.Data.Entities.BaseEntities;
using StudentLifeHelper.Data.Entities.InfoEntities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace StudentLifeHelper.Data.Entities.MainEntities
{

    [Table("chats")]
    [Index(nameof(StatusId), Name = "ix_chats_status_id")]
    public class Chat : BaseCommonEntity
    {
        [Key]
        [Required]
        [Column("id")]
        public Guid Id { get; set; }


        [Required]
        [Column("status_id")]
        public int StatusId { get; set; }


        [ForeignKey(nameof(StatusId))]
        public virtual Status? Status { get; set; }

        [InverseProperty(nameof(UserChat.Chat))]
        public virtual List<UserChat>? UserChats { get; set; }

        [InverseProperty(nameof(Message.Chat))]
        public virtual List<Message>? Messages { get; set; }


    }
}
