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

    [Table("room_post_contents")]
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
