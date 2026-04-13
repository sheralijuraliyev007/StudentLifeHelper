using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Common.Constants
{
    public static class StateConstants 
    {
        public const int Active = 1;
        public const int Passive = 2;
        public const int Pending = 3;
        public const int Updated = 4;


        public static readonly int[] CanActivate = [Passive, Pending];
        public static readonly int[] CanDeactivate = [Active, Pending];
        public static readonly int[] CanUpdate = [Active, Pending, Updated];



        public static bool CanTransition(int currentState, int targetState)
        {
            return targetState switch
            {
                Active => CanActivate.Contains(currentState),
                Passive => CanDeactivate.Contains(currentState),
                Pending => CanUpdate.Contains(currentState),
                _ => false

            };
        }
    }

    
}
