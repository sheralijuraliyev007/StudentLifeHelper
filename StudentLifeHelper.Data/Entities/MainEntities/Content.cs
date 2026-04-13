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
    [Table("contents")]
    [Index(nameof(StateCode), Name = "ix_contents_state_code")]
    [Index(nameof(ContentTypeCode), Name = "ix_contents_content_type_code")]
    [Index(nameof(StateCode),nameof(ContentTypeCode), Name = "ix_contents_state_content_type")]
    public class Content : BaseCommonEntity
    {
        [Required]
        [Key]
        [Column("id")]
        public long Id { get; set; }

        [Required]
        [MaxLength(200)]
        [Column("name")]
        public string Name { get; set; } = string.Empty!;

        [Required]
        [Column("file_id")]
        public Guid FileId { get; set; }

        [Required]
        [Column("folder")]
        [MaxLength(200)]
        public string Folder { get; set; } = string.Empty!;

        [Required]
        [Column("content_type_code")]
        public int ContentTypeCode { get; set; }


        [ForeignKey(nameof(ContentTypeCode))]

        public virtual ContentType? ContentType { get; set; }


        [Required]
        [Column("state_code")]
        public int StateCode { get; set; }

        [ForeignKey(nameof(StateCode))]
        public virtual State? State { get; set; }


        [InverseProperty(nameof(RoomPostContent.Content))]
        public virtual List<RoomPostContent>? RoomPostContents { get; set; }

    }
}
