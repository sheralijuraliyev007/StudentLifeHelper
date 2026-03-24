using Microsoft.EntityFrameworkCore;
using StudentLifeHelper.Data.Entities.BaseEntities;
using StudentLifeHelper.Data.Entities.InfoEntities;

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Xml.Linq;


namespace StudentLifeHelper.Data.Entities.MainEntities
{

    [Table("currency_posts")]
    [Index(nameof(UserId), Name = "ix_currency_posts_user_id")]
    [Index(nameof(StatusId), Name = "ix_currency_posts_status_id")]
    [Index(nameof(ToCurrencyId), Name = "ix_currency_posts_to_currency_id")]
    [Index(nameof(FromCurrencyId), Name = "ix_currency_posts_from_currency_id")]
    [Index(nameof(FromCurrencyId), nameof(ToCurrencyId), Name = "ix_currency_posts_from_to_currency_id")]
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
        [Column("from_currency_id")]
        public int FromCurrencyId { get; set; }

        public virtual CurrencyType? FromCurrencyType { get; set; }

        [Required]
        [Column("to_currency_id")]
        public int ToCurrencyId { get; set; }

        public virtual CurrencyType? ToCurrencyType { get; set; }


        [Required]
        [Column("amount")]
        public decimal Amount { get; set; }


        [Required]
        [Column("status_id")]
        public int StatusId { get; set; }

        [ForeignKey(nameof(StatusId))]
        public virtual Status? Status { get; set; }


    }
}
