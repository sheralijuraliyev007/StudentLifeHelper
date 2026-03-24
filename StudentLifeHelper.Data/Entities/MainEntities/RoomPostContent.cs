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

    [Index(nameof(StatusId), Name = "ix_room_post_contents_status_id")]
    [Index(nameof(ContentId), Name = "ix_room_post_contents_content_id")]
    [Index(nameof(RoomPostId), Name = "ix_room_post_contents_room_post_id")]
    // Unique index for active content per post (filtered where StatusId = 1)
    [Index(nameof(RoomPostId), nameof(ContentId), Name = "ux_room_post_contents_room_post_content_active", IsUnique = true)]
    // Unique index for one cover per post (filtered where IsCover = true && StatusId = 1)
    [Index(nameof(RoomPostId), Name = "ux_room_post_contents_one_cover_per_post", IsUnique = true)]
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
        [Column("status_id")]
        public int StatusId { get; set; }

        [ForeignKey(nameof(StatusId))]
        public virtual Status? Status { get; set; }

    }
}
