
namespace StudentLifeHelper.Api.Controllers.Admin.Info
{
    public class TranslationController : BaseInfoController<Translation, InfoTranslationCreateModel, InfoTranslationUpdateModel,InfoTranslationDto,long>
    {
        private readonly ITranslationInfoService _translationInfoService;
        private readonly SqlQueryStore _sqlQueryStore;




        public TranslationController(ITranslationInfoService translationInfoService, SqlQueryStore sqlQueryStore)
            : base(translationInfoService, sqlQueryStore)
        {
            _translationInfoService = translationInfoService;
            _sqlQueryStore = sqlQueryStore;
        }

        [HttpGet]
        public async Task<IActionResult> GetRecordTranslations(int tableCode, int recordCode)
        {
            var result = await _translationInfoService.GetRecordTranslations(tableCode, recordCode);

            if (service.IsValid)
                return Ok(new ApiResponse<IEnumerable<InfoTranslationDto>?>
                {
                    Data = result,
                    Queries = _sqlQueryStore.GetAll().ToList()
                });

            return BadRequest(service.Errors);
        }

        [HttpGet]
   
        public async Task<IActionResult> GetTranslation(int tableCode, int recordCode, string columnName)
        {
            var result = await _translationInfoService.GetTranslation (tableCode, recordCode, columnName);

            if (service.IsValid)
                return Ok(new ApiResponse<string?>
                {
                    Data = result,
                    Queries = _sqlQueryStore.GetAll().ToList()
                });

            return BadRequest(service.Errors);
        }
    }
}