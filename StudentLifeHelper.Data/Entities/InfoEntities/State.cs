using Microsoft.EntityFrameworkCore;
using StudentLifeHelper.Data.Entities.BaseEntities;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentLifeHelper.Data.Entities.InfoEntities
{
    [Table("info.info_state")]
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
        [MaxLength(15)]
        public string FullName { get; set; } = string.Empty!;


        [Column("code")]
        [Required]
        public int Code { get; set; }

    }
}
