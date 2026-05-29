using StudentLifeHelper.Common.Dtos.MainPage;
using StudentLifeHelper.Common.Models.MainPage.CurrencyPost;


namespace StudentLifeHelper.Service.MainPage.Base.Interface
{
    public interface ICurrencyPostService :
        IMainPageBaseService<CurrencyPostFilterOptions, CurrencyPostDto, CreateCurrencyPostModel, UpdateCurrencyPostModel>
    {
    }
}
