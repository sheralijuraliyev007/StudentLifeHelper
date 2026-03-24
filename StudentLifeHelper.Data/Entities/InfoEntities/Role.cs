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
    [Table("info.info_role")]
    [Index(nameof(StateId), Name = "ix_info_role_state_id")]
    [Index(nameof(InfoTableId), Name = "ix_info_role_info_table_id")]
    [Index(nameof(FullName), Name = "ui_info_role_full_name", IsUnique =true)]
    [Index(nameof(ShortName), Name = "ui_info_role_short_name", IsUnique =true)]
    [Index(nameof(Code), Name = "ui_info_role_code", IsUnique =true)]

    public class Role : BaseInfoEntity
    {
        [Required]
        [Column("info_table_id")]
        public int InfoTableId { get; set; }


        [ForeignKey(nameof(InfoTableId))]
        public virtual InfoTable? InfoTable { get; set; }

    }
}
