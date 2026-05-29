using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Common.Dtos.SqlLog
{
    public class SqlQueryStore
    {
        private readonly List<SqlQueryEntry> _queries = new();
        public void Add(string sql, TimeSpan duration) =>
            _queries.Add(new SqlQueryEntry(sql, duration));
        public IReadOnlyList<SqlQueryEntry> GetAll() => _queries;
    }
}
