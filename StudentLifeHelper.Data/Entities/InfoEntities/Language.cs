using Microsoft.EntityFrameworkCore;
using StudentLifeHelper.Data.Entities.BaseEntities;
using StudentLifeHelper.Data.Entities.MainEntities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Data.Entities.InfoEntities
{

    [Table("info_language", Schema = "info")]
    [Index(nameof(StateCode), Name = "ix_info_language_state_code")]
    public class Language : BaseInfoEntity
    {
        [InverseProperty(nameof(User.Language))]
        public virtual List<User>? Users{ get; set; }
    }
}
