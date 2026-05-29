namespace StudentLifeHelper.Common.Constants
{
    public static class StatusConstants
    {
        public const int CreatedStatusCode = 1;
        public const int ActiveStatusCode = 2;
        public const int UpdatedStatusCode = 3;
        public const int ArchivedStatusCode = 4;
        public const int PassiveStatusCode = 6;
        public const int DeletedStatusCode = 5;

        public const string CreatedStatusCodeShortName = "CREATED";
        public const string ActiveStatusCodeShortName = "ACTIVE";
        public const string UpdatedStatusCodeShortName = "UPDATED";
        public const string ArchivedStatusCodeShortName = "ARCHIVED";
        public const string PassiveStatusCodeShortName = "PASSIVE";
        public const string DeletedStatusCodeShortName = "DELETED";

        public const string CreatedStatusCodeFullName = "Created";
        public const string ActiveStatusCodeFullName = "Active";
        public const string UpdatedStatusCodeFullName = "Updated";
        public const string ArchivedStatusCodeFullName = "Archived";
        public const string PassiveStatusCodeFullName = "Passive";
        public const string DeletedStatusCodeFullName = "Deleted";

        public static readonly int[] CanUpdate = [CreatedStatusCode, ActiveStatusCode,ArchivedStatusCode, PassiveStatusCode, UpdatedStatusCode];
        public static readonly int[] CanActivate = [CreatedStatusCode, PassiveStatusCode, ArchivedStatusCode];
        public static readonly int[] CanArchive = [ActiveStatusCode, UpdatedStatusCode, PassiveStatusCode];
        public static readonly int[] CanDeactivate = [ActiveStatusCode, UpdatedStatusCode];
        public static readonly int[] CanDelete = [CreatedStatusCode, ActiveStatusCode, UpdatedStatusCode, ArchivedStatusCode, PassiveStatusCode];


        public static bool CanApply(int currentStatusCode, int targetStatusCode)
        {
            return  targetStatusCode switch
            {
                UpdatedStatusCode => CanUpdate.Contains(currentStatusCode),
                ActiveStatusCode => CanActivate.Contains(currentStatusCode),
                ArchivedStatusCode => CanArchive.Contains(currentStatusCode),
                PassiveStatusCode => CanDeactivate.Contains(currentStatusCode),
                DeletedStatusCode => CanDelete.Contains(currentStatusCode),
                _ => false
            };
        }

    }
}
