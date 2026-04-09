namespace StudentLifeHelper.Data.Entities.InfoEntities
{
    public interface IHasCommonAttributes
    {
        Guid CreatedUserId { get; set; }

        Guid? ModifiedUserId { get; set; }

        DateTime? ModifiedDateTime { get; set; }

    }
}
