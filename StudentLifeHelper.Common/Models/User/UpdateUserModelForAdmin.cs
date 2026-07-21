

namespace StudentLifeHelper.Common.Models.User
{
    public record class UpdateUserModelForAdmin : UpdateUserModel
    {
        public int? RoleCode { get; set; }
    }
}
