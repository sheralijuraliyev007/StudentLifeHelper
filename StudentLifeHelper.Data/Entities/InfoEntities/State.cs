namespace StudentLifeHelper.Data.Entities.InfoEntities
{
    [Table("info_state",Schema =  "info")]
    [Index(nameof(Code), IsUnique =true)]
    public class State : BaseCommonEntity
    {

        [Key]
        [Required]
        [Column("id")]
        public int Id { get; set; }


        [Column("short_name")]
        [Required]
        [MaxLength(15)]
        public string ShortName { get; set; } = string.Empty!;


        [Column("full_name")]
        [Required]
        [MaxLength(200)]
        public string FullName { get; set; } = string.Empty!;


        [Column("code")]
        [Required]
        public int Code { get; set; }

    }
}
