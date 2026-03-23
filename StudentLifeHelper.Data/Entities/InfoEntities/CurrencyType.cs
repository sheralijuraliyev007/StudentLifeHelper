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

    [Table("info.info_currency_type")]
    public class CurrencyType : BaseInfoEntity
    {
        [Required]
        [Column("info_table_id")]
        public int InfoTableId { get; set; }


        [Column("symbol")]
        [MaxLength(10)]
        public string? Symbol { get; set; }



        [ForeignKey(nameof(InfoTableId))]
        public virtual InfoTable? InfoTable { get; set; }

    }
}
