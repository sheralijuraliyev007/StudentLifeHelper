namespace StudentLifeHelper.Data.Entities.InfoEntities
{
    [Table("info_table",Schema =  "info")]
    [Index(nameof(StateCode), Name = "ix_info_table_state_code")]
    public class InfoTable : BaseInfoEntity    {

    }
}
