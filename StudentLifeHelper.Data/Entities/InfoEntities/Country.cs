using Microsoft.EntityFrameworkCore;
using StudentLifeHelper.Data.Entities.BaseEntities;
using StudentLifeHelper.Data.Entities.MainEntities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace StudentLifeHelper.Data.Entities.InfoEntities
{

    [Table("info_country",Schema =  "info")]
    [Index(nameof(StateId),Name = "ix_info_country_state_id")]
    [Index(nameof(InfoTableId),Name = "ix_info_country_info_table_id")]
    [Index(nameof(FullName),Name = "ui_info_country_full_name", IsUnique =true)]
    [Index(nameof(ShortName),Name = "ui_info_country_short_name", IsUnique =true)]
    [Index(nameof(Code),Name = "ui_info_country_code", IsUnique =true)]
    public class Country : BaseInfoEntity
    {

        [InverseProperty(nameof(User.BirthCountry))]
        public virtual List<User>? BirthUsers{ get; set; }

        [InverseProperty(nameof(User.ResidenceCountry))]
        public virtual List<User>? ResidenceUsers{ get; set; }

    }
}
