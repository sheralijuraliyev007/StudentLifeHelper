using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Common.Models.Info
{
    public class UpdateModel
    {
        [Required]
        public int Code { get; set; }

        [Required]
        [MaxLength(15)]
        public string ShortName { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string FullName { get; set; } = string.Empty;
    }
}
