

namespace StudentLifeHelper.Api.Controllers.Public
{
    public class ContentController(IContentService contentService) : BasePublicController
    {
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult> DownloadFile(Guid fileId)
        {
            var result = await contentService.DownloadFile(fileId);
            if (contentService.IsValid)
            {
                var (data, type, name) = result!.Value;
                if (data?.Length > CommonConstants.RangeTreshhold)
                    return File(data!, type!, name, enableRangeProcessing: true);

                return File(data!, type!, name);
            }

            return BadRequest();
        }
    }
}
