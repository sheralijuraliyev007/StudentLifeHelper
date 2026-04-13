using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Common.Models.Info.ContentType
{
    public class InfoContentTypeCreateModel : BaseInfoCreateModel
    {
        [Required]
        public string TypeName { get; set; } = string.Empty!;
    }
}
