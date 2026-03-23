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
        [Column("status_id")]
        public int StatusId { get; set; }

        [ForeignKey(nameof(StatusId))]
        public virtual Status? Status { get; set; }


    }
}
