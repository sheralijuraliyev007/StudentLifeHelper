

using Microsoft.EntityFrameworkCore;
using StudentLifeHelper.Data.Entities.BaseEntities;
using System.ComponentModel.DataAnnotations.Schema;



namespace StudentLifeHelper.Data.Entities.InfoEntities
{
    [Table("info.info_table")]
    [Index(nameof(StateId), Name = "ix_info_table_state_id")]
    public class InfoTable :BaseInfoEntity
    {
    }
}
