namespace StudentLifeHelper.Common.Extensions
{
    public static class CommonExtensions
    {
        public static string GetFileUrl(this Guid id) => CommonConstants.FileBaseUrl + id.ToString();
    }
}
