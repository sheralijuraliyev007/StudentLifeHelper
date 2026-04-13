using Microsoft.EntityFrameworkCore;
using StudentLifeHelper.Data.Entities.InfoEntities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Data.Entities.MainEntities
{

    [Table("user_chats")]
    [Index(nameof(StatusCode),Name = "ix_user_chats_status_id")]
    [Index(nameof(UserId),Name = "ix_user_chats_user_id")]
    [Index(nameof(ChatId),Name = "ix_user_chats_chat_id")]
    [Index(nameof(UserId),nameof(StatusCode),Name = "ix_user_chats_user_status")]

    public class UserChat
    {
        [Key]
        [Required]
        [Column("id")]
        public long Id { get; set; }


        [Required]
        [Column("user_id")]
        public Guid UserId { get; set; }

        [ForeignKey(nameof(UserId))]
        public virtual User? User { get; set; }

        [Required]
        [Column("chat_id")]
        public Guid ChatId { get; set; }


        [ForeignKey(nameof(ChatId))]
        public virtual Chat? Chat { get; set; }


        [Required]
        [Column("status_code")]
        public int StatusCode { get; set; }

        [ForeignKey(nameof(StatusCode))]
        public virtual Status? Status { get; set; }


    }
}
