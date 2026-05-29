using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Common.Models.Info.Region
{
    public class InfoRegionCreateModel : BaseInfoCreateModel
    {
        [Required]
        public int CountryCode { get; set; }
    }
}
