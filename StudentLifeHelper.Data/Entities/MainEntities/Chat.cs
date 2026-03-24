using Microsoft.EntityFrameworkCore;
using StudentLifeHelper.Data.Entities.BaseEntities;
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

    }
}
