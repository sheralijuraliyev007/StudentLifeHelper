namespace StudentLifeHelper.Common.Dtos.MainPage
{
    public class RoomPostContentDto
    {
        public long Id { get; set; }

        public long RoomPostId { get; set; }

        public long ContentId { get; set; }

        public bool IsCover { get; set; }

        public string Url { get; set; } = default!;

    }
}
