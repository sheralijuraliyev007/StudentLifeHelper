using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Common.Models.Info.CurrencyType
{
    public class InfoCurrencyTypeCreateModel : BaseInfoCreateModelWithTableId
    {
        [Required]
        [MaxLength(10)]
        public string Symbol { get; set; } = string.Empty!;
    }
}
