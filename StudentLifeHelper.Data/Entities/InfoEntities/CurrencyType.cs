namespace StudentLifeHelper.Data.Entities.InfoEntities
{

    [Table("info_currency_type",Schema =  "info")]
    [Index(nameof(StateCode), Name = "ix_info_currency_type_state_code")]
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
