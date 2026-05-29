namespace StudentLifeHelper.Data.Entities.MainEntities
{

    [Table("currency_posts")]
    [Index(nameof(UserId), Name = "ix_currency_posts_user_id")]
    [Index(nameof(StatusCode), Name = "ix_currency_posts_status_code")]
    [Index(nameof(ToCurrencyCode), Name = "ix_currency_posts_to_currency_code")]
    [Index(nameof(FromCurrencyCode), Name = "ix_currency_posts_from_currency_code")]
    [Index(nameof(FromCurrencyCode), nameof(ToCurrencyCode), Name = "ix_currency_posts_from_to_currency_code")]
    [Index(nameof(CreatedDateTime), Name = "ix_currency_posts_created_date_time")]
    public class CurrencyPost : BaseCommonEntity
    {
        [Key]
        [Required]
        [Column("id")]
        public long Id { get; set; }


        [Required]
        [Column("title")]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty!;


        [Required]
        [Column("description")]
        [MaxLength(4000)]
        public string Description { get; set; } = string.Empty!;


        [Required]
        [Column("user_id")]
        public Guid UserId { get; set; }

        [ForeignKey(nameof(UserId))]
        public virtual User? User { get; set; }


        [Required]
        [Column("from_currency_code")]
        public int FromCurrencyCode { get; set; }


        [ForeignKey(nameof(FromCurrencyCode))]
        public virtual CurrencyType? FromCurrencyType { get; set; }

        [Required]
        [Column("to_currency_code")]

        public int ToCurrencyCode { get; set; }

        [ForeignKey(nameof(ToCurrencyCode))]
        public virtual CurrencyType? ToCurrencyType { get; set; }


        [Required]
        [Column("amount")]
        public decimal Amount { get; set; }


        [Required]
        [Column("status_code")]
        public int StatusCode { get; set; }

        [ForeignKey(nameof(StatusCode))]
        public virtual Status? Status { get; set; }


    }
}
