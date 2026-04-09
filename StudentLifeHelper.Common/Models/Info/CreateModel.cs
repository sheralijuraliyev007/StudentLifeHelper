using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Common.Models.Info
{
    public class CreateModel
    {
        [Required]
        public int Code { get; set; }


        [Required]
        [MaxLength(15)]
        public string ShortName { get; set; } = null!;


        [Required]
        [MaxLength(200)]
        public string FullName { get; set; } = null!;

        [Required]
        public int InfoTableId { get; set; }
    }
}
