using Microsoft.EntityFrameworkCore;
using StudentLifeHelper.Data.Entities.BaseEntities;
using StudentLifeHelper.Data.Entities.MainEntities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentLifeHelper.Data.Entities.InfoEntities
{

    [Table("info_currency_type",Schema =  "info")]
    [Index(nameof(StateId), Name = "ix_info_currency_type_state_id")]
    [Index(nameof(InfoTableId), Name = "ix_info_currency_type_info_table_id")]
    [Index(nameof(ShortName), Name = "ui_info_currency_type_short_name", IsUnique = true)]
    public class CurrencyType : BaseInfoEntity
    {


        [Column("symbol")]
        [MaxLength(10)]
        public string? Symbol { get; set; }


        [InverseProperty(nameof(CurrencyPost.FromCurrencyType))]
        public virtual List<CurrencyPost>? FromCurrencyPosts { get; set; }

        [InverseProperty(nameof(CurrencyPost.ToCurrencyType))]
        public virtual List<CurrencyPost>? ToCurrencyPosts { get; set; }


        [InverseProperty(nameof(RoomPost.CurrencyType))]
        public virtual List<RoomPost>? RoomPosts { get; set; }

    }
}
