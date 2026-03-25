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
    [Table("info.info_room_type")]
    [Index(nameof(StateId), Name = "ix_info_room_type_state_id")]
    [Index(nameof(InfoTableId), Name = "ix_info_room_type_info_table_id")]
    [Index(nameof(InfoTableId) , nameof(Code), Name = "ui_info_room_type_code", IsUnique =true)]
    [Index(nameof(InfoTableId) , nameof(ShortName), Name = "ui_info_room_type_short_name", IsUnique =true)]

    public class RoomType:BaseInfoEntity
    {
        [Required]
        [Column("info_table_id")]
        public int InfoTableId { get; set; }

        [ForeignKey(nameof(InfoTableId))]
        public virtual InfoTable? InfoTable { get; set; }

        [InverseProperty(nameof(RoomPost.RoomType))]
        public virtual List<RoomPost>? RoomPosts { get; set; }
    }
}
