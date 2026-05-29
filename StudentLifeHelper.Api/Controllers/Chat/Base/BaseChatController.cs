namespace StudentLifeHelper.Api.Controllers.Chat.Base
{

    [Authorize]
    [Route("api/chat/[controller]/[action]")]
    public abstract class BaseChatController : ControllerBase
    {
    }
}
