namespace StudentLifeHelper.Data.Entities.BaseEntities
{
    public class BaseInfoEntity : BaseCommonEntity, IHasState, IHasCommonAttributes 
    {
        [Required]
        [Column("id")]
        public int Id { get; set; }


        [Required]
        [Column("code")]
        [Range(1, int.MaxValue)]
        public int Code { get; set; }


        [Required]
        [Column("short_name")]
        [MaxLength(15)]
        public string ShortName { get; set; } = string.Empty!;


        [Required]
        [Column("full_name")]
        [MaxLength(200)]
        public string FullName { get; set; } = string.Empty!;

        [Required]
        [Column("state_code")]
        public int StateCode { get; set; }


        [ForeignKey(nameof(StateCode))]
        public virtual State? State { get; set; }

    } 
}
