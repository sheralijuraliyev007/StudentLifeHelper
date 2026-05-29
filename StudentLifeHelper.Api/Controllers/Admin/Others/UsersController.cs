using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualBasic;
using StudentLifeHelper.Api.Controllers.Admin.Base;
using StudentLifeHelper.Common.FilterOptions;
using StudentLifeHelper.Common.Models.User;
using StudentLifeHelper.Data.Entities.MainEntities;
using StudentLifeHelper.Service.Admin.User.Interfaces;
using StudentLifeHelper.Service.Public.Content.Interfaces;

namespace StudentLifeHelper.Api.Controllers.Admin.Others
{
    public class UsersController(IAdminUserService adminUserService, IContentService contentService, SqlQueryStore sqlQueryStore) : BaseAdminController
    {
        private readonly SqlQueryStore _sqlQueryStore = sqlQueryStore;
        [HttpPost]
        public async Task<IActionResult> GetAll(AdminUserFilterOptions filterOptions)
        {
            var result = await adminUserService.GetAllAsync(filterOptions);
            if (!adminUserService.IsValid)
                return BadRequest(adminUserService.Errors);
            return Ok(new ApiResponse<PaginationModel<UserDtoForAdmin>>
            {
                Data = result,
                Queries = _sqlQueryStore.GetAll().ToList()
            });

            
        }


        [HttpGet]
        public async Task<IActionResult> GetByUsername(string username)
        {
            var result = await adminUserService.GetByUsernameAsync(username);
            if (!adminUserService.IsValid)
                return BadRequest(adminUserService.Errors);
            return Ok(new ApiResponse<UserDtoForAdmin?>
            {
                Data = result,
                Queries = _sqlQueryStore.GetAll().ToList()
            });
        }

        [HttpPut("{userId:guid}")]
        public async Task<IActionResult> Activate(Guid userId)
        {
            var result = await adminUserService.ActivateAsync(userId);
            if (!adminUserService.IsValid)
                return BadRequest(adminUserService.Errors);
            return Ok(new ApiResponse<string?>
            {
                Data = result,
                Queries = _sqlQueryStore.GetAll().ToList()
            });
        }


        [HttpPut("{userId:guid}")]
        public async Task<IActionResult> Deactivate(Guid userId)
        {
            var result = await adminUserService.DeactivateAsync(userId);
            if (!adminUserService.IsValid)
                return BadRequest(adminUserService.Errors);
            return Ok(new ApiResponse<string?>
            {
                Data = result,
                Queries = _sqlQueryStore.GetAll().ToList()
            });
        }


        [HttpPut("{userId:guid}")]
        public async Task<IActionResult> Update(Guid userId, UpdateUserModelForAdmin updateUserModelForAdmin)
        {
            var result = await adminUserService.UpdateAsync(userId, updateUserModelForAdmin);
            if (!adminUserService.IsValid)
                return BadRequest(adminUserService.Errors);
            return Ok(new ApiResponse<string?>
            {
                Data = result,
                Queries = _sqlQueryStore.GetAll().ToList()
            });
        }


        [HttpPut("{userId:guid}")]
        public async Task<IActionResult> UpdateUserImage(Guid userId, IFormFile img)
        {
            var result = await adminUserService.UpdateUserImage(userId, img);
            if (!adminUserService.IsValid)
                return BadRequest(adminUserService.Errors);
            return Ok(new ApiResponse<string?>
            {
                Data = result,
                Queries = _sqlQueryStore.GetAll().ToList()
            });
        }

            [HttpDelete("{userId:guid}")]
        public async Task<IActionResult> Delete(Guid userId)
        {
            var result = await adminUserService.DeleteAsync(userId);
            if (!adminUserService.IsValid)
                return BadRequest(adminUserService.Errors);
            return Ok(new ApiResponse<string?>
            {
                Data = result,
                Queries = _sqlQueryStore.GetAll().ToList()
            });
        }
    }
}
