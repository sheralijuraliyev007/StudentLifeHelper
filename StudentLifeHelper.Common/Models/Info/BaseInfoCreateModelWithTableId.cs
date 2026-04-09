using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Common.Models.Info
{
    public class BaseInfoCreateModelWithTableId : BaseInfoCreateModel
    {
        [Required]
        public int InfoTableId { get; set; }
    }
}
