using Microsoft.EntityFrameworkCore;
using StudentLifeHelper.Data.Entities.BaseEntities;
using StudentLifeHelper.Data.Entities.MainEntities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentLifeHelper.Data.Entities.InfoEntities
{

    [Table("info_gender",Schema =  "info")]
    [Index(nameof(StateId),Name = "ix_info_gender_state_id")]
    [Index(nameof(InfoTableId),Name = "ix_info_gender_info_table_id")]
    [Index(nameof(FullName),Name = "ui_info_gender_full_name", IsUnique =true)]
    [Index(nameof(ShortName),Name = "ui_info_gender_short_name", IsUnique =true)]
    [Index(nameof(Code),Name = "ui_info_gender_code", IsUnique =true)]

    public class Gender: BaseInfoEntity
    {

        [Required]
        [Column("info_table_id")]
        public int InfoTableId { get; set; }


        [ForeignKey(nameof(InfoTableId))]
        public virtual InfoTable? InfoTable { get; set; }


        [InverseProperty(nameof(User.Gender))]
        public virtual List<User>? Users { get; set; }

        [InverseProperty(nameof(RoomPost.Gender))]
        public virtual List<RoomPost>? ForGenderRoomPosts { get; set; }

    }
}
