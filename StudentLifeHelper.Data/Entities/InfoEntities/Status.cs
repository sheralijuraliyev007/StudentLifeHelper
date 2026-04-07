using Microsoft.EntityFrameworkCore;
using StudentLifeHelper.Data.Entities.BaseEntities;
using StudentLifeHelper.Data.Entities.MainEntities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Resources;

namespace StudentLifeHelper.Data.Entities.InfoEntities
{
    [Table("info_status",Schema =  "info")]
    [Index(nameof(StateId),Name = "ix_info_status_table_state_id")]
    [Index(nameof(InfoTableId),Name = "ix_info_status_table_info_table_id")]
    [Index(nameof(InfoTableId),nameof(Code),Name = "ui_info_status_table_code",IsUnique =true)]
    [Index(nameof(InfoTableId),nameof(ShortName),Name = "ui_info_status_table_short_name", IsUnique =true)]
    public class Status : BaseInfoEntity
    {

        [Required]
        [Column("info_table_id")]
        public int InfoTableId { get; set; }


        [ForeignKey(nameof(InfoTableId))]
        public virtual InfoTable? InfoTable { get; set; }


        [InverseProperty(nameof(Chat.Status))]
        public virtual List<Chat>? Chats { get; set; }


        [InverseProperty(nameof(CurrencyPost.Status))]
        public virtual List<CurrencyPost>? CurrencyPosts { get; set; }


        [InverseProperty(nameof(Message.Status))]
        public virtual List<Message>? Messages { get; set; }

        [InverseProperty(nameof(RoomPost.Status))]
        public virtual List<RoomPost>? RoomPosts { get; set; }


        [InverseProperty(nameof(RoomPostContent.Status))]
        public virtual List<RoomPostContent>? RoomPostContents { get; set; }

        [InverseProperty(nameof(UserChat.Status))]
        public virtual List<UserChat>? UserChats { get; set; }


    }

}
