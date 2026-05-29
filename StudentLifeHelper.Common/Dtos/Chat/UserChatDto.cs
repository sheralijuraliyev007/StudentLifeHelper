using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Common.Dtos.Chat
{
    public class UserChatDto
    {
        public long Id { get; set; }
        public Guid UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string? ProfileImageUrl { get; set; }
        public Guid ChatId { get; set; }
        public int StatusCode { get; set; }
        public string StatusName { get; set; } = string.Empty;
    }
}
