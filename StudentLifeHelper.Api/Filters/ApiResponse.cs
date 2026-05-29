using StudentLifeHelper.Common.Dtos.SqlLog;

namespace StudentLifeHelper.Api.Filters
{
    public class ApiResponse<T>
    {
        public T? Data { get; set; }
        public List<SqlQueryEntry> Queries { get; set; } = [];
    }
}
