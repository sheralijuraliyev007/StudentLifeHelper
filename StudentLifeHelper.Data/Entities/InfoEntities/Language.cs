namespace StudentLifeHelper.Data.Entities.InfoEntities
{

    [Table("info_language", Schema = "info")]
    [Index(nameof(StateCode), Name = "ix_info_language_state_code")]
    public class Language : BaseInfoEntity
    {
        [InverseProperty(nameof(User.Language))]
        public virtual List<User>? Users{ get; set; }
    }
}
