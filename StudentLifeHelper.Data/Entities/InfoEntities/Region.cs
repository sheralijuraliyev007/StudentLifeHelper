using Microsoft.EntityFrameworkCore;
using StudentLifeHelper.Data.Entities.BaseEntities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Data.Entities.InfoEntities
{
    [Table("info.info_region")]
    [Index(nameof(StateId),Name = "ix_info_region_state_id")]
    [Index(nameof(InfoTableId),Name = "ix_info_region_info_table_id")]
    [Index(nameof(InfoTableId),nameof(Code),Name = "ui_info_region_code", IsUnique =true)]
    [Index(nameof(InfoTableId),nameof(ShortName),Name = "ui_info_region_short_name", IsUnique =true)]
    [Index(nameof(InfoTableId),nameof(FullName),Name = "ui_info_region_full_name", IsUnique =true)]
    
    public class Region : BaseInfoEntity
    {
        [Required]
        [Column("info_table_id")]
        public int InfoTableId { get; set; }


        [ForeignKey(nameof(InfoTableId))]
        public virtual InfoTable? InfoTable { get; set; } 
    }
}
