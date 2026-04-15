using StatusGeneric;
using StudentLifeHelper.Common.Models.Manual;
using StudentLifeHelper.Data.Entities.InfoEntities;
using StudentLifeHelper.Data.Repositories.Interfaces;
using StudentLifeHelper.Service.Common.Interfaces;
using StudentLifeHelper.Service.Public.Manual.Extensions;
using StudentLifeHelper.Service.Public.Manual.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentLifeHelper.Service.Public.Manual
{
    public class ManualService(IUserHelper userHelper, IUnitOfWork unitOfWork) : StatusGenericHandler,IManualService
    {
        public async Task<SelectList<int>> GenderSelect()
        {
            IQueryable<Gender> genders = unitOfWork.GenderRepository().GetAll();

            var list = genders.AsSelectList();

            return list;
        }

        public async T
    }
}
