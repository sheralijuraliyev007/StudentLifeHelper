using Microsoft.EntityFrameworkCore;
using StudentLifeHelper.Data.Entities.BaseEntities;
using StudentLifeHelper.Data.Entities.MainEntities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace StudentLifeHelper.Data.Entities.InfoEntities
{
    [Table("info_room_post_type",Schema =  "info")]
    [Index(nameof(StateId), Name = "ix_info_room_post_type_state_id")]
    [Index(nameof(InfoTableId), Name = "ix_info_room_post_type_info_table_id")]
    [Index(nameof(InfoTableId), nameof(Code),Name = "ui_info_room_post_type_code", IsUnique =true)]
    [Index(nameof(InfoTableId), nameof(ShortName),Name = "ui_info_room_post_type_short_name", IsUnique =true)]

    public class RoomPostType : BaseInfoEntity
    {

        [InverseProperty(nameof(RoomPost.RoomPostType))]
        public virtual List<RoomPost>? RoomPosts { get; set; }
    }
}
