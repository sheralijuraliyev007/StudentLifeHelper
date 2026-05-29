namespace StudentLifeHelper.Service.Chat.QueryObjects
{
    public static class ChatListSortFilter
    {
        public static IQueryable<UserChat> ApplyFilter(
            this IQueryable<UserChat> query,
            ChatFilterOptions options,
            Guid currentUserId)
        {
            // Only current user's chats
            query = query.Where(uc => uc.UserId == currentUserId);

            // Filter by the other person's username
            if (!string.IsNullOrEmpty(options.Username))
                query = query.Where(uc => uc.Chat!.UserChats!
                    .Any(x => x.UserId != currentUserId &&
                         x.User!.Username.Contains(options.Username)));

            query = query.ApplyBaseFilter(options);
            return query;
        }
    }
}
