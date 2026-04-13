using Microsoft.EntityFrameworkCore;
using StudentLifeHelper.Data.Entities.BaseEntities;
using StudentLifeHelper.Data.Entities.MainEntities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Data.Entities.InfoEntities
{
    [Table("info_role",Schema =  "info")]
    [Index(nameof(StateCode), Name = "ix_info_role_state_code")]
    public class Role : BaseInfoEntity
    {
        [InverseProperty(nameof(User.Role))]
        public virtual List<User>? Users{ get; set; }

    }
}
