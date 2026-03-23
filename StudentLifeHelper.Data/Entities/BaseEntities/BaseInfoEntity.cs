using StudentLifeHelper.Data.Entities.InfoEntities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Data.Entities.BaseEntities
{
    public class BaseInfoEntity : BaseCommonEntity, IHasState
    {
        [Required]
        [Column("id")]
        public int Id { get; set; }


        [Required]
        [Column("code")]
        [Range(1,int.MaxValue)]
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
        [Column("state_id")]
        public int StateId { get; set; }


        [ForeignKey(nameof(StateId))]
        public virtual State? State { get; set; } 



    }
}
