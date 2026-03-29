using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Common.Settings.MioIO
{
    public class MinIOSettings
    {
        public required string Endpoint { get; set; }

        public required string AccessKey { get; set; }

        public required string SecretKey { get; set; }

        public required string BucketName { get; set; }

        public bool Secure { get; set; }
    }
}
