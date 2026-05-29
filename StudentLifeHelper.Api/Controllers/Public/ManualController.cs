
namespace StudentLifeHelper.Api.Controllers.Public
{
    public class ManualController(IManualService manualService, SqlQueryStore sqlQueryStore) : BasePublicController()
    {
        private readonly SqlQueryStore _sqlQueryStore = sqlQueryStore;
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetGenderSelect()
        {
            var result = await manualService.GenderSelect();


            if (result != null)
            {
                return Ok(new ApiResponse<SelectList<int>>
                {
                    Data = result,
                    Queries = _sqlQueryStore.GetAll().ToList()
                });
            }
            return BadRequest();
        }



        [HttpGet]
        public async Task<IActionResult> GetCountrySelect()
        {
            var result = await manualService.CountriesSelect();


            if (result != null)
            {
                return Ok(new ApiResponse<SelectList<int>>
                {
                    Data = result,
                    Queries = _sqlQueryStore.GetAll().ToList()
                });
            }
            return BadRequest();
        }





        [HttpGet]
        [Authorize(Roles = RoleConstants.UserRoleFullName)]
        public async Task<IActionResult> GetRoomTypeSelect()
        {
            var result = await manualService.RoomTypesSelect();


            if (result != null)
            {
                return Ok(new ApiResponse<SelectList<int>>
                {
                    Data = result,
                    Queries = _sqlQueryStore.GetAll().ToList()
                });
            }
            return BadRequest();
        }


        //[HttpGet]
        //[Authorize(Roles = RoleConstants.AdminRoleFullName)]
        //public async Task<IActionResult> GetContentTypeSelect()
        //{
        //    var result = await manualService.ContentTypesSelect();


        //    if (result != null)
        //    {
        //        return Ok(result);
        //    }
        //    return BadRequest();
        //}

        [HttpGet]
        [Authorize(Roles = RoleConstants.UserRoleFullName)]
        public async Task<IActionResult> GetCurrencyTypeSelect()
        {
            var result = await manualService.CurrenciesSelect();


            if (result != null)
            {
                return Ok(new ApiResponse<SelectList<int>>
                {
                    Data = result,
                    Queries = _sqlQueryStore.GetAll().ToList()
                });
            }
            return BadRequest();
        }

        [HttpGet]
        [Authorize(Roles = RoleConstants.UserRoleFullName)]
        public async Task<IActionResult> GetRoomPostTypeSelect()
        {
            var result = await manualService.RoomPostTypesSelect();


            if (result != null)
            {
                return Ok(new ApiResponse<SelectList<int>>
                {
                    Data = result,
                    Queries = _sqlQueryStore.GetAll().ToList()
                });
            }
            return BadRequest();
        }

        [HttpGet]
        [Authorize(Roles = RoleConstants.UserRoleFullName)]
        public async Task<IActionResult> GetStatusSelect()
        {
            var result = await manualService.StatusSelect();


            if (result != null)
            {
                return Ok(new ApiResponse<SelectList<int>>
                {
                    Data = result,
                    Queries = _sqlQueryStore.GetAll().ToList()
                });
            }
            return BadRequest();
        }

        [HttpGet]
        //[Authorize(Roles = RoleConstants.UserRoleFullName)]
        public async Task<IActionResult> GetRegionSelect(int countryCode)
        {
            var result = await manualService.RegionsSelect(countryCode);


            if (result != null)
            {
                return Ok(new ApiResponse<SelectList<int>>
                {
                    Data = result,
                    Queries = _sqlQueryStore.GetAll().ToList()
                });
            }
            return BadRequest();
        }


        [HttpGet]
        //[Authorize(Roles = RoleConstants.UserRoleFullName)]
        public async Task<IActionResult> GetLanguageSelect()
        {
            var result = await manualService.LanguagesSelect();


            if (result != null)
            {
                return Ok(new ApiResponse<SelectList<int>>
                {
                    Data = result,
                    Queries = _sqlQueryStore.GetAll().ToList()
                });
            }
            return BadRequest();
        }

    }
}
