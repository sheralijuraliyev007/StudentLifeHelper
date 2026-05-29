namespace StudentLifeHelper.Common.FilterOptions
{
    public class MessageFilterOptions : BaseFilterOptions
    {
        // Filter messages in a specific reply thread
        public long? ReplyToMessageId { get; set; }

        // Filter by date range
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }
}
