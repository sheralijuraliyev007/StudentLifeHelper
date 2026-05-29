using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Service.Common.Interfaces
{
    public interface IUserHelper
    {
        Guid? GetUserId();

        string GetUsername();

        string GetUserRole();
        int GetUserRoleId();

        Task<int> GetUserLanguageCode();
    }
}
