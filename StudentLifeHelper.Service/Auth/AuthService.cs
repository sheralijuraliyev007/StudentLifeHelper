using StudentLifeHelper.Data.Repositories.Interfaces;
using StudentLifeHelper.Service.Public.Content.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Service.Auth
{
    public class AuthService(IUnitOfWork unitOfWork, IContentService) : IAuthService
    {
    }
}
