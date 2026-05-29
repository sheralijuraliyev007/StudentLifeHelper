using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Common.Dtos.SqlLog
{
    public record SqlQueryEntry(string Sql, TimeSpan Duration);
}
