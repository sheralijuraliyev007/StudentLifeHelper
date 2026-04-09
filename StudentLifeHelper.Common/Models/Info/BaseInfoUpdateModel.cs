using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Common.Models.Info
{
    public class BaseInfoUpdateModel
    {
        [Required]
        public int Code { get; set; }

        [MaxLength(15)]
        public string? ShortName { get; set; }

        [MaxLength(200)]
        public string? FullName { get; set; }
    }
}
