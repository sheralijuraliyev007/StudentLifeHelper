using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Common.Dtos.Chat
{
    public class ChatDto
    {
        public Guid Id { get; set; }
        public int StatusCode { get; set; }
        public string StatusName { get; set; } = string.Empty;

        // The other participant (since 1-on-1, just show them)
        public Guid OtherUserId { get; set; }
        public string OtherUsername { get; set; } = string.Empty;
        public string? OtherUserProfileImageUrl { get; set; }

        // Last message preview (for chat list UI)
        public string? LastMessageText { get; set; }
        public DateTime? LastMessageAt { get; set; }
        public Guid? LastMessageFromUserId { get; set; }

        // Unread badge
        public int UnreadCount { get; set; }
    }
}
