namespace StudentLifeHelper.Common.Dtos.Chat
{
    public class MessageDto
    {
        public long Id { get; set; }
        public Guid ChatId { get; set; }
        public Guid FromUserId { get; set; }
        public string FromUsername { get; set; } = string.Empty;

        // If deleted, frontend shows "This message was deleted" 
        // instead of MessageText
        public bool IsDeleted { get; set; }
        public string? MessageText { get; set; } // null when deleted

        public int StatusCode { get; set; }
        public string StatusName { get; set; } = string.Empty;
        public DateTime CreatedDateTime { get; set; }
        public DateTime? ModifiedDateTime { get; set; } // shows "edited" label in UI

        // Reply support
        public long? ReplyToMessageId { get; set; }
        public string? ReplyToMessageText { get; set; }
        public string? ReplyToUsername { get; set; }
        public bool ReplyToIsDeleted { get; set; } // replied message may also be deleted

        public DateTime? ReadAt { get; set; }
    }
}
