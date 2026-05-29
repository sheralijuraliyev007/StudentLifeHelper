namespace StudentLifeHelper.Data.Entities.InfoEntities
{

    [Table("info_country",Schema =  "info")]
    [Index(nameof(StateCode),Name = "ix_info_country_state_code")]
    public class Country : BaseInfoEntity
    {

        [InverseProperty(nameof(User.BirthCountry))]
        public virtual List<User>? BirthUsers{ get; set; }

        [InverseProperty(nameof(User.ResidenceCountry))]
        public virtual List<User>? ResidenceUsers{ get; set; }

        [InverseProperty(nameof(Region.Country))]
        public virtual List<Region>? Regions { get; set; }

    }
}
