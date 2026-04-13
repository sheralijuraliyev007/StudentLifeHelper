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
using System.Xml.Linq;

namespace StudentLifeHelper.Data.Entities.MainEntities
{

    [Table("room_post_contents")]

    [Index(nameof(StatusCode), Name = "ix_room_post_contents_status_code")]
    [Index(nameof(ContentId), Name = "ix_room_post_contents_content_id")]
    [Index(nameof(RoomPostId), Name = "ix_room_post_contents_room_post_id")]
    public class RoomPostContent : BaseCommonEntity
    {
        [Required]
        [Column("id")]
        [Key]
        public long Id { get; set; }

        [Required]
        [Column("room_post_id")]
        public long RoomPostId { get; set; }


        [ForeignKey(nameof(RoomPostId))]
        public virtual RoomPost? RoomPost { get; set; }


        [Required]
        [Column("content_id")]
        public long ContentId { get; set; }

        [ForeignKey(nameof(ContentId))]
        public virtual Content? Content { get; set; }


        [Required]
        [Column("is_cover")]
        public bool IsCover { get; set; }


        [Required]
        [Column("status_code")]
        public int StatusCode { get; set; }

        [ForeignKey(nameof(StatusCode))]
        public virtual Status? Status { get; set; }

    }
}
