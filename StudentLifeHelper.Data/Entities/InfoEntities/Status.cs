using Microsoft.EntityFrameworkCore;
using StudentLifeHelper.Data.Entities.BaseEntities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Resources;

namespace StudentLifeHelper.Data.Entities.InfoEntities
{
    [Table("info.info_status")]
    [Index(nameof(StateId),Name = "ix_info_status_table_state_id")]
    [Index(nameof(InfoTableId),Name = "ix_info_status_table_info_table_id")]
    [Index(nameof(InfoTableId),nameof(Code),Name = "ui_info_status_table_code",IsUnique =true)]
    [Index(nameof(InfoTableId),nameof(ShortName),Name = "ui_info_status_table_short_name", IsUnique =true)]
    public class Status : BaseInfoEntity
    {

        [Required]
        [Column("info_table_id")]
        public int InfoTableId { get; set; }


        [ForeignKey(nameof(InfoTableId))]
        public virtual InfoTable? InfoTable { get; set; }
    }
}
