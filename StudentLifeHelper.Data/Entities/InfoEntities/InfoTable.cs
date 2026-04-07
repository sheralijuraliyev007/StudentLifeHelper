

using Microsoft.EntityFrameworkCore;
using StudentLifeHelper.Data.Entities.BaseEntities;
using System.ComponentModel.DataAnnotations.Schema;



namespace StudentLifeHelper.Data.Entities.InfoEntities
{
    [Table("info_table",Schema =  "info")]
    [Index(nameof(StateId), Name = "ix_info_table_state_id")]
    public class InfoTable :BaseInfoEntity
    {
    }
}
