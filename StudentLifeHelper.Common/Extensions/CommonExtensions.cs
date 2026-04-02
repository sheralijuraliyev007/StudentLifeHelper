using StudentLifeHelper.Common.Constants;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Common.Extensions
{
    public static class CommonExtensions
    {
        public static string GetFileUrl(this Guid id) => CommonConstants.FileBaseUrl + id.ToString();
    }
}
