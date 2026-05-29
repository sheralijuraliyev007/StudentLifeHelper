namespace StudentLifeHelper.Common.FilterOptions
{
    public class ChatFilterOptions : BaseFilterOptions
    {
        // Filter by the other person's username (search for a specific conversation)
        public string? Username { get; set; }
    }
}
