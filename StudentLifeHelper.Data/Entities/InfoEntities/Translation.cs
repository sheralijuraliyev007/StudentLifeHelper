using Microsoft.EntityFrameworkCore;
using StudentLifeHelper.Data.Entities.BaseEntities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Data.Entities.InfoEntities
{


    [Table("info_translation", Schema = "info")]
    [Index(nameof(TableCode), Name = "ix_info_translation_info_table_code")]
    [Index(nameof(LanguageCode), Name = "ix_info_translation_language_code")]
    [Index(nameof(StateCode), Name = "ix_info_translation_state_code")]
    [Index(nameof(TableCode), nameof(RecordCode), nameof(ColumnName), nameof(LanguageCode), Name = "ui_info_translation_unique", IsUnique =true)]
    public class Translation : BaseInfoEntity
    {
        [Required]
        [Column("table_code")]
        public int TableCode { get; set; }
        
        [Required]
        [Column("language_code")]
        public int LanguageCode { get; set; }

        [Required]
        [Column("record_code")]
        public int RecordCode { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("column_name")]
        public string ColumnName { get; set; } = string.Empty!;

        [Required]
        [Column("translated_text")]
        public string TranslatedText { get; set; } = string.Empty!;


    }
}
