using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Common.Dtos.Info
{
    public class BaseInfoDto
    {
        public int Id { get; set; }

        public int Code { get; set; }

        public string ShortName { get; set; } 

        public string FullName { get; set; }

        public int StateCode { get; set; }
    }
}
