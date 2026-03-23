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
    public class Content
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

        public virtual ContentType? CoontentType { get; set; }


        [Required]
        [Column("state_id")]
        public int StateId { get; set; }

        [ForeignKey(nameof(StateId))]
        public virtual State? State { get; set; }

    }
}
