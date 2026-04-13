using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Common.Models.Info.Translation
{
    public class InfoTranslationCreateModel
    {

        [Required]
        public int TableCode { get; set; }

        [Required]
        public int LanguageCode { get; set; }

        [Required]
        public int RecordCode { get; set; }

        [MaxLength(100)]
        [Required]
        public string ColumnName { get; set; } = string.Empty!;

        [Required]
        public string TranslatedText { get; set; } = string.Empty!;
    }
}
