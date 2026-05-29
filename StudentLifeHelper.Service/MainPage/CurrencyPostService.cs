namespace StudentLifeHelper.Service.MainPage
{
    public class CurrencyPostService(IUnitOfWork unitOfWork, IUserHelper userHelper)
        : StatusGenericHandler, ICurrencyPostService
    {
        public async Task<long?> AddAsync(CreateCurrencyPostModel createModel)
        {
            var userId = userHelper.GetUserId();
            if (userId == null)
            {
                AddError("User not found");
                return null;
            }

            if (createModel.FromCurrencyCode == createModel.ToCurrencyCode)
            {
                AddError("From currency and To currency cannot be the same");
                return null;
            }
            var currencyPost = createModel.MapToEntity<CurrencyPost, CreateCurrencyPostModel>();
            currencyPost.UserId = userId.Value;
            currencyPost.CreatedUserId = userId.Value;
            currencyPost.StatusCode = StatusConstants.ActiveStatusCode;

            await unitOfWork.CurrencyPostRepository().Add(currencyPost);
            await unitOfWork.SaveChanges();
            return currencyPost.Id;
        }

        public async Task<PaginationModel<CurrencyPostDto>> GetAllAsync(CurrencyPostFilterOptions filterOptions)
        {
            var query = unitOfWork.CurrencyPostRepository()
                .GetAll(c => c.User!, c => c.Status!, c => c.FromCurrencyType!, c => c.ToCurrencyType!)
                .Where(c => c.StatusCode == StatusConstants.ActiveStatusCode || c.StatusCode == StatusConstants.UpdatedStatusCode);

            var config = GetCustomConfig();

            return query
                .ApplyFilter(filterOptions)
                .ProjectToType<CurrencyPostDto>(config)
                .ToPaginationModel(filterOptions.Page, filterOptions.PageSize);
        }

        public async Task<CurrencyPostDto?> GetByIdAsync(long id)
        {
            var (currencyPost, isExist) = await CheckCurrencyPostExists(id);
            if (!isExist || currencyPost == null)
                return null;

            var config = GetCustomConfig();
            return currencyPost.MapToDto<CurrencyPost, CurrencyPostDto>(config);
        }

        public async Task<string?> UpdateAsync(UpdateCurrencyPostModel updateModel, long id)
        {


            if (updateModel.FromCurrencyCode == updateModel.ToCurrencyCode)
            {
                AddError("From currency and To currency cannot be the same");
                return null;
            }
            var (currencyPost, isExist) = await CheckCurrencyPostExists(id);
            if (!isExist || currencyPost == null)
                return null;

            var userId = userHelper.GetUserId();
            if (userId == null)
            {
                AddError("User not found");
                return null;
            }

            if (currencyPost.UserId != userId.Value)
            {
                AddError("You are not authorized to update this post");
                return null;
            }

            if (!CanApply(currencyPost.StatusCode, StatusConstants.UpdatedStatusCode))
            {
                AddError("Cannot update post in its current status");
                return null;
            }

            currencyPost = updateModel.MapForUpdate(currencyPost);
            currencyPost.StatusCode = StatusConstants.UpdatedStatusCode;
            currencyPost.ModifiedUserId = userId.Value;
            currencyPost.ModifiedDateTime = DateTime.UtcNow;

            await unitOfWork.CurrencyPostRepository().Update(currencyPost);
            await unitOfWork.SaveChanges();
            return "Currency post updated successfully";
        }

        public async Task<PaginationModel<CurrencyPostDto>?> GetUserPosts(CurrencyPostFilterOptions filters)
        {
            var userId = userHelper.GetUserId();
            if (userId == null)
            {
                AddError("User not found");
                return null;
            }

            var config = GetCustomConfig();

            var query = unitOfWork.CurrencyPostRepository()
                .GetAll(c => c.User!, c => c.Status!, c => c.FromCurrencyType!, c => c.ToCurrencyType!)
                .Where(c => c.UserId == userId.Value && c.StatusCode != StatusConstants.DeletedStatusCode);

            return query
                .ApplyFilter(filters)
                .ProjectToType<CurrencyPostDto>(config)
                .ToPaginationModel(filters.Page, filters.PageSize);
        }

        public Task<string?> ActivateAsync(long id) =>
            UpdateStatusAsync(id, StatusConstants.ActiveStatusCode, "Activated");

        public Task<string?> DeactivateAsync(long id) =>
            UpdateStatusAsync(id, StatusConstants.PassiveStatusCode, "Deactivated");

        public Task<string?> DeleteAsync(long id) =>
            UpdateStatusAsync(id, StatusConstants.DeletedStatusCode, "Deleted");

        private async Task<string?> UpdateStatusAsync(long id, int targetStatusCode, string message)
        {
            var (currencyPost, isExist) = await CheckCurrencyPostExists(id);
            if (!isExist || currencyPost == null)
                return null;

            var userId = userHelper.GetUserId();
            if (!userId.HasValue)
            {
                AddError("User not found");
                return null;
            }

            if (currencyPost.UserId != userId.Value)
            {
                AddError("You are not authorized to change status of this post");
                return null;
            }

            if (!CanApply(currencyPost.StatusCode, targetStatusCode))
            {
                AddError($"Cannot change status from {currencyPost.StatusCode} to {targetStatusCode}");
                return null;
            }

            currencyPost.StatusCode = targetStatusCode;
            currencyPost.ModifiedDateTime = DateTime.UtcNow;
            currencyPost.ModifiedUserId = userId.Value;

            await unitOfWork.CurrencyPostRepository().Update(currencyPost);
            await unitOfWork.SaveChanges();
            return message;
        }

        private async Task<(CurrencyPost? currencyPost, bool isExist)> CheckCurrencyPostExists(long id)
        {
            var currentUserId = userHelper.GetUserId();
            if (currentUserId == null)
            {
                AddError("User not found");
                return (null, false);
            }

            var currencyPost = await unitOfWork.CurrencyPostRepository()
                .GetAll(c => c.User!, c => c.Status!, c => c.FromCurrencyType!, c => c.ToCurrencyType!)
                .FirstOrDefaultAsync(c => c.Id == id &&
                    c.StatusCode != StatusConstants.DeletedStatusCode);

            if (currencyPost == null)
            {
                AddError("Currency post not found");
                return (null, false);
            }

            return (currencyPost, true);
        }

        private bool CanApply(int currentStatusCode, int targetStatusCode)
        {
            return StatusConstants.CanApply(currentStatusCode, targetStatusCode);
        }

        private static TypeAdapterConfig GetCustomConfig()
        {
            var config = new TypeAdapterConfig();
            config.NewConfig<CurrencyPost, CurrencyPostDto>()
                .Map(dest => dest.Username, src => src.User!.Username)
                .Map(dest => dest.StatusName, src => src.Status!.FullName)
                .Map(dest => dest.FromCurrencyName, src => src.FromCurrencyType!.FullName)
                .Map(dest => dest.FromCurrencySymbol, src => src.FromCurrencyType!.Symbol)
                .Map(dest => dest.ToCurrencyName, src => src.ToCurrencyType!.FullName)
                .Map(dest => dest.ToCurrencySymbol, src => src.ToCurrencyType!.Symbol);
            return config;
        }
    }
}