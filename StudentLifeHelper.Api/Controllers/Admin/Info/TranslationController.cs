using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentLifeHelper.Api.Controllers.Admin.Base;
using StudentLifeHelper.Common.Dtos.Info;
using StudentLifeHelper.Common.Models.Info.Translation;
using StudentLifeHelper.Data.Entities.InfoEntities;
using StudentLifeHelper.Service.Admin.Base.Interfaces;

namespace StudentLifeHelper.Api.Controllers.Admin.Info
{
    public class TranslationController : BaseInfoController<Translation, InfoTranslationCreateModel, InfoTranslationUpdateModel,InfoTranslationDto,long>
    {
        private readonly ITranslationInfoService _translationInfoService;



        
        public  TranslationController(ITranslationInfoService translationInfoService) : base(translationInfoService)
        {
            _translationInfoService = translationInfoService;
        }

        [HttpGet]
        public async Task<IActionResult> GetRecordTranslations(int tableCode, int recordCode)
        {
            var result = await _translationInfoService.GetRecordTranslations(tableCode, recordCode);

            if (service.IsValid)
                return Ok(result);

            return BadRequest(service.Errors);
        }

        [HttpGet]
   
        public async Task<IActionResult> GetTranslation(int tableCode, int recordCode, string columnName)
        {
            var result = await _translationInfoService.GetTranslation (tableCode, recordCode, columnName);

            if (service.IsValid)
                return Ok(result);

            return BadRequest(service.Errors);
        }
    }
}