using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Data.Entities.BaseEntities
{

    public abstract class BaseCommonEntity
    {

        [Required]
        [Column("created_user_id")]
        public Guid CreatedUserId { get; set; }

        [Required]
        [Column("created_date_time")]
        public DateTime CreatedDateTime { get; set; }


        [Required]
        [Column("modified_user_id")]
        public Guid? ModifiedUserId{ get; set; }

        [Required]
        [Column("modified_date_time")]
        public DateTime? ModifiedDateTime { get; set; }

    }
}
