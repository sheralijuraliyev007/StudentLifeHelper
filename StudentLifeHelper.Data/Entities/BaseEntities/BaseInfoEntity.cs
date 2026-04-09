using StudentLifeHelper.Data.Entities.InfoEntities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace StudentLifeHelper.Data.Entities.BaseEntities
{
    public class BaseInfoEntity : BaseCommonEntity, IHasState, IHasCommonAttributes ,IHasInfoTable
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

        [Required]
        [Column("info_table_id")]
        public int InfoTableId { get; set; }

        [ForeignKey(nameof(InfoTableId))]
        public virtual InfoTable? InfoTable { get; set; }
    } 
}
