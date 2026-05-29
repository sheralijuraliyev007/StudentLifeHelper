using Microsoft.AspNetCore.SignalR;
using StudentLifeHelper.Service.Chat.Interfaces;


namespace StudentLifeHelper.Api.Hubs
{
    [Authorize]
    public class ChatHub(IUserHelper userHelper) : Hub<IChatHub>
    {
        public override async Task OnConnectedAsync()
        {
            var userId = userHelper.GetUserId();
            if (userId.HasValue)
                await Groups.AddToGroupAsync(Context.ConnectionId, userId.Value.ToString());
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = userHelper.GetUserId();
            if (userId.HasValue)
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId.Value.ToString());
            await base.OnDisconnectedAsync(exception);
        }
    }
}
