using System;
using System.Collections.Generic;
using System.Linq;
using System.Security;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Common.Dtos.Auth
{
    public record TokenDto(string AccessToken, string RefreshToken);
}
