using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Common.Models.Info.Translation
{
    public class InfoTranslationUpdateModel
    {
        public int? TableCode { get; set; }

        
        public int? LanguageCode { get; set; }

        
        public int? RecordCode { get; set; }

      
        public string? ColumnName { get; set; } 

        
        public string? TranslatedText { get; set; }
    }
}
