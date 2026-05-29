namespace StudentLifeHelper.Data.Entities.MainEntities
{

    [Table("room_post_contents")]
    [Index(nameof(ContentId), Name = "ix_room_post_contents_content_id")]
    [Index(nameof(RoomPostId), Name = "ix_room_post_contents_room_post_id")]
    public class RoomPostContent : BaseCommonEntity
    {
        [Required]
        [Column("id")]
        [Key]
        public long Id { get; set; }

        [Required]
        [Column("room_post_id")]
        public long RoomPostId { get; set; }


        [ForeignKey(nameof(RoomPostId))]
        public virtual RoomPost? RoomPost { get; set; }


        [Required]
        [Column("content_id")]
        public long ContentId { get; set; }

        [ForeignKey(nameof(ContentId))]
        public virtual Content? Content { get; set; }


        [Required]
        [Column("is_cover")]
        public bool IsCover { get; set; }
        
    }
}
