using Microsoft.EntityFrameworkCore;

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
