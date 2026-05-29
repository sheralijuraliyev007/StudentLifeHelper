using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Service.Chat.QueryObjects
{
    public static class MessageListSortFilter
    {
        public static IQueryable<Message> ApplyFilter(
            this IQueryable<Message> query,
            MessageFilterOptions options,
            Guid chatId)
        {
            query = query.Where(m => m.ChatId == chatId);

            if (options.ReplyToMessageId.HasValue)
                query = query.Where(m => m.ReplyToMessageId == options.ReplyToMessageId);

            if (!string.IsNullOrEmpty(options.Search))
                query = query.Where(m => m.MessageText.Contains(options.Search));

            if (options.FromDate.HasValue)
                query = query.Where(m => m.CreatedDateTime >= options.FromDate);

            if (options.ToDate.HasValue)
                query = query.Where(m => m.CreatedDateTime <= options.ToDate);

            query = query.OrderByDescending(m => m.CreatedDateTime);

            return query;
        }
    }
}
