using StudentLifeHelper.Data.Entities.BaseEntities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace StudentLifeHelper.Data.Entities.InfoEntities
{
    [Table("info.info_room_post_type")]
    public class RoomPostType : BaseInfoEntity
    {
        [Required]
        [Column("info_table_id")]
        public int InfoTableId { get; set; }

        public virtual InfoTable? InfoTable { get; set; }
    }
}
