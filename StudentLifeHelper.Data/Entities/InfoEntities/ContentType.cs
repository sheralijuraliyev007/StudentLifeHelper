namespace StudentLifeHelper.Data.Entities.InfoEntities
{
    [Table("info_content_type",Schema = "info")]
    [Index(nameof(StateCode),Name = "ix_info_content_type_state_code")]
    [Index(nameof(TypeName), Name = "ix_info_content_type_type_name", IsUnique =true)]
    public class ContentType : BaseInfoEntity
    {

        [Required]
        [Column("type_name")]
        [MaxLength(100)]
        public string TypeName { get; set; } = null!;


        [InverseProperty(nameof(Content.ContentType))]
        public virtual List<Content>? Contents{ get; set; }
    }
}
