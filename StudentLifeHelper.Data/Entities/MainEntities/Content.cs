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
    [Index(nameof(StateId), Name = "ix_contents_state_id")]
    [Index(nameof(ContentTypeId), Name = " ix_contents_content_type_id")]
    [Index(nameof(StateId), nameof(ContentTypeId), Name = "ix_contents_state_content_type")]
    // Unique filtered index: folder + name where state_id = 1
    [Index(nameof(Folder), nameof(Name), Name = "ui_contents_folder_name", IsUnique = true)]
    // Case-insensitive unique index: folder + lower(name) where state_id = 1
    [Index(nameof(Folder), Name = "ui_contents_folder_name_active_ci", IsUnique = true)]
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
        [Column("file_name")]
        public Guid FileName { get; set; }

        [Required]
        [Column("folder")]
        [MaxLength(200)]
        public string Folder { get; set; } = string.Empty!;

        [Required]
        [Column("content_type_id")]
        public int ContentTypeId { get; set; }


        [ForeignKey("ContentTypeId")]

        public virtual ContentType? ContentType { get; set; }


        [Required]
        [Column("state_id")]
        public int StateId { get; set; }

        [ForeignKey(nameof(StateId))]
        public virtual State? State { get; set; }


        [InverseProperty(nameof(RoomPostContent.Content))]
        public virtual List<RoomPostContent>? RoomPostContents { get; set; }

    }
}
