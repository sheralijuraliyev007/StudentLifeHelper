

using Microsoft.EntityFrameworkCore;
using StudentLifeHelper.Data.Entities.BaseEntities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;



namespace StudentLifeHelper.Data.Entities.InfoEntities
{
    [Table("info_table",Schema =  "info")]
    [Index(nameof(StateId), Name = "ix_info_table_state_id")]
    public class InfoTable : BaseCommonEntity, IHasState, IHasCommonAttributes
    {
        [Required]
        [Column("id")]
        public int Id { get; set; }


        [Required]
        [Column("code")]
        [Range(1, int.MaxValue)]
        public int Code { get; set; }


        [Required]
        [Column("short_name")]
        [MaxLength(15)]
        public string ShortName { get; set; } = string.Empty!;


        [Required]
        [Column("full_name")]
        [MaxLength(200)]
        public string FullName { get; set; } = string.Empty!;

        [Required]
        [Column("state_id")]
        public int StateId { get; set; }


        [ForeignKey(nameof(StateId))]
        public virtual State? State { get; set; }
    }
}
