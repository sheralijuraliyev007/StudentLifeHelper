using StudentLifeHelper.Data.Entities.BaseEntities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentLifeHelper.Data.Entities.InfoEntities
{
    [Table("info.info_status")]
    public class Status : BaseInfoEntity
    {

        [Required]
        [Column("info_table_id")]
        public int InfoTableId { get; set; }


        [ForeignKey(nameof(InfoTableId))]
        public virtual InfoTable? InfoTable { get; set; }
    }
}
