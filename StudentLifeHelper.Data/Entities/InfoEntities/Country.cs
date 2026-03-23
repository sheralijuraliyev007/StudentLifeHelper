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
    [Table("info.info_country")]
    public class Country : BaseInfoEntity
    {
        [Required]
        [Column("info_table_id")]
        public int InfoTableId { get; set; }

        public virtual InfoTable? InfoTable { get; set; }
    }
}
