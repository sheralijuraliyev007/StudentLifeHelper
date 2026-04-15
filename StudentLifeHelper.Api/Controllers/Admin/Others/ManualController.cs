using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StudentLifeHelper.Api.Controllers.Admin.Base;
using StudentLifeHelper.Common.Constants;
using StudentLifeHelper.Data.Entities.InfoEntities;
using StudentLifeHelper.Service.Public.Manual.Interfaces;

namespace StudentLifeHelper.Api.Controllers.Admin.Others
{
    public class ManualController(IManualService manualService) : BaseAdminController
    {
        [HttpGet]
        [Authorize(Roles =RoleConstants.AdminRoleFullName )]
        public async Task<IActionResult> GetGenderSelect()
        {
            var result = await manualService.GenderSelect();
             

            if (manualService.IsValid)
            {
                return Ok(result);
            }
            return BadRequest();
        }


        [HttpGet]
        [Authorize(Roles = RoleConstants.AdminRoleFullName)]
        public async Task<IActionResult> GetRoleSelect()
        {
            var result = await manualService.RolesSelect();


            if (manualService.IsValid)
            {
                return Ok(result);
            }
            return BadRequest();
        }


        [HttpGet]
        [Authorize(Roles = RoleConstants.AdminRoleFullName)]
        public async Task<IActionResult> GetCountrySelect()
        {
            var result = await manualService.CountriesSelect();


            if (manualService.IsValid)
            {
                return Ok(result);
            }
            return BadRequest();
        }


        [HttpGet]
        [Authorize(Roles = RoleConstants.AdminRoleFullName)]
        public async Task<IActionResult> GetInfoTableSelect()
        {
            var result = await manualService.InfoTablesSelect();


            if (manualService.IsValid)
            {
                return Ok(result);
            }
            return BadRequest();
        }


        [HttpGet]
        [Authorize(Roles = RoleConstants.AdminRoleFullName)]
        public async Task<IActionResult> GetRoomTypeSelect()
        {
            var result = await manualService.RoomTypesSelect();


            if (manualService.IsValid)
            {
                return Ok(result);
            }
            return BadRequest();
        }


        [HttpGet]
        [Authorize(Roles = RoleConstants.AdminRoleFullName)]
        public async Task<IActionResult> GetContentTypeSelect()
        {
            var result = await manualService.ContentTypesSelect();


            if (manualService.IsValid)
            {
                return Ok(result);
            }
            return BadRequest();
        }

        [HttpGet]
        [Authorize(Roles = RoleConstants.AdminRoleFullName)]
        public async Task<IActionResult> GetCurrencyTypeSelect()
        {
            var result = await manualService.CurrenciesSelect();


            if (manualService.IsValid)
            {
                return Ok(result);
            }
            return BadRequest();
        }

        [HttpGet]
        [Authorize(Roles = RoleConstants.AdminRoleFullName)]
        public async Task<IActionResult> GetRoomPostTypeSelect()
        {
            var result = await manualService.RoomPostTypesSelect();


            if (manualService.IsValid)
            {
                return Ok(result);
            }
            return BadRequest();
        }

        [HttpGet]
        [Authorize(Roles = RoleConstants.AdminRoleFullName)]
        public async Task<IActionResult> GetStatusSelect()
        {
            var result = await manualService.StatusSelect();


            if (manualService.IsValid)
            {
                return Ok(result);
            }
            return BadRequest();
        }

        [HttpGet]
        [Authorize(Roles = RoleConstants.AdminRoleFullName)]
        public async Task<IActionResult> GetRegionSelect(int countryCode)
        {
            var result = await manualService.RegionsSelect(countryCode);


            if (manualService.IsValid)
            {
                return Ok(result);
            }
            return BadRequest();
        }


    }
}
