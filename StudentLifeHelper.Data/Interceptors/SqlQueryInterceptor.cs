using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using StudentLifeHelper.Common.Dtos.SqlLog;
using System.Data.Common;

namespace StudentLifeHelper.Data.Interceptors
{
    public class SqlQueryInterceptor : DbCommandInterceptor
    {
        private readonly SqlQueryStore _store;
        public SqlQueryInterceptor(SqlQueryStore store) => _store = store;

        // Captures sync queries
        public override DbDataReader ReaderExecuted(DbCommand command, CommandExecutedEventData data, DbDataReader result)
        {
            _store.Add(command.CommandText, data.Duration);
            return base.ReaderExecuted(command, data, result);
        }

        // Captures async queries (ToListAsync, FirstOrDefaultAsync, etc.)
        public override ValueTask<DbDataReader> ReaderExecutedAsync(DbCommand command, CommandExecutedEventData data, DbDataReader result, CancellationToken cancellationToken = default)
        {
            _store.Add(command.CommandText, data.Duration);
            return base.ReaderExecutedAsync(command, data, result, cancellationToken);
        }

        public override int NonQueryExecuted(DbCommand command, CommandExecutedEventData data, int result)
        {
            _store.Add(command.CommandText, data.Duration);
            return base.NonQueryExecuted(command, data, result);
        }

        public override ValueTask<int> NonQueryExecutedAsync(DbCommand command, CommandExecutedEventData data, int result, CancellationToken cancellationToken = default)
        {
            _store.Add(command.CommandText, data.Duration);
            return base.NonQueryExecutedAsync(command, data, result, cancellationToken);
        }
    }
}
