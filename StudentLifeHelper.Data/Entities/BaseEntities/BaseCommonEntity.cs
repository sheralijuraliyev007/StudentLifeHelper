namespace StudentLifeHelper.Data.Entities.BaseEntities
{

    public abstract class BaseCommonEntity 
    {

        [Required]
        [Column("created_user_id")]
        public Guid CreatedUserId { get; set; }

        [Required]
        [Column("created_date_time")]
        public DateTime CreatedDateTime { get; set; } = DateTime.UtcNow;


        
        [Column("modified_user_id")]
        public Guid? ModifiedUserId{ get; set; }

        
        [Column("modified_date_time")]
        public DateTime? ModifiedDateTime { get; set; }

    }
}
