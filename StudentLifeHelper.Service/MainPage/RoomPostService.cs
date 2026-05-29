using StudentLifeHelper.Common.Dtos.MainPage;
using StudentLifeHelper.Common.Models.MainPage.RoomPost;
using StudentLifeHelper.Service.MainPage.Base.Interface;
using StudentLifeHelper.Service.MainPage.QueryObjects;
using System.IO;
namespace StudentLifeHelper.Service.MainPage
{
    public class RoomPostService(IUnitOfWork unitOfWork, IUserHelper userHelper, IContentService contentService)
    : StatusGenericHandler, IRoomPostService
    {

        public async Task<long?> AddAsync(CreateRoomPostModel createModel)
        {
            await using var transaction =  unitOfWork.BeginTransaction();

            try
            {
                var roomPost =  createModel.MapToEntity<RoomPost, CreateRoomPostModel>();

                var userId = userHelper.GetUserId();
                if (userId == null)
                {
                    return null;
                }

                roomPost.DepositExists = roomPost.DepositAmount.HasValue
                                         && roomPost.DepositAmount > 0;
                (roomPost.UserId,  roomPost.CreatedUserId) = (userId.Value, userId.Value);
                roomPost.StatusCode = StatusConstants.CreatedStatusCode;
                

                await unitOfWork.RoomPostRepository().Add(roomPost);
                await unitOfWork.SaveChanges();
                await transaction.CommitAsync();
                return roomPost.Id;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                AddError(ex.Message);
                return null;
            }
        }


        public async Task<PaginationModel<RoomPostDto>> GetAllAsync(RoomPostFilterOptions filterOptions)
        {
            var query = (unitOfWork.RoomPostRepository().GetAll(r => r.User!, r => r.Status!,r=> r.CurrencyType!, r => r.RoomPostType!, r=>r.RoomType!, r=>r.Region!, r=>r.ForGender, r => r.RoomPostContents))
                .Where(r => r.StatusCode == StatusConstants.ActiveStatusCode);

            query = query.Include(r => r.RoomPostContents.Where(x => x.IsCover));

            var congig = GetCustomConfig();

            var result = query.ApplyFilter(filterOptions)
                .ProjectToType<RoomPostDto>(congig)
                .ToPaginationModel(page: filterOptions.Page, filterOptions.PageSize);

            foreach (var item in result.Rows) { 
                if(Guid.TryParse(item.CoverImageUrl, out var fileId))
                {
                    item.CoverImageUrl = fileId.GetFileUrl();
                }
            }

            return result;
        }

        public async Task<RoomPostDto?> GetByIdAsync(long id)
        {
            var (roomPost, isExist) = await CheckRoomPostExists(id, true);

            if (roomPost == null || !isExist)
                return null;

            var config = GetCustomConfig();
            var dto = roomPost.MapToDto<RoomPost, RoomPostDto>(config);

            // Fix cover image
            if (Guid.TryParse(dto.CoverImageUrl, out var fileId))
                dto.CoverImageUrl = fileId.GetFileUrl();

            // Fix gallery images — get all FileIds in one query
            var contentIds = dto.RoomPostContents?
                .Select(c => c.ContentId)
                .ToList() ?? [];

            var fileIdMap = await unitOfWork.ContentRepository()
                .GetAll()
                .Where(c => contentIds.Contains(c.Id))
                .Select(c => new { c.Id, c.FileId })
                .ToDictionaryAsync(c => c.Id, c => c.FileId);

            foreach (var content in dto.RoomPostContents ?? [])
            {
                if (fileIdMap.TryGetValue(content.ContentId, out var guid))
                    content.Url = guid.GetFileUrl(); // ✅ now uses the real GUID
            }

            return dto;
        }


        public async Task<string?> UpdateAsync(UpdateRoomPostModel updateModel, long id)
        {
            var(roomPost, isExist) =  await CheckRoomPostExists(id, true);
            if (!isExist)
                return null;

            

            if (!CanApply(roomPost!.StatusCode, StatusConstants.UpdatedStatusCode))
            {
                AddError("Cannot update room post in its current status.");
                return null; 
            }
            var userId = userHelper.GetUserId();
            if(userId == null)
            {
                AddError($"User not found with the provided ID. {userId}");
                return null;
            }

            if (roomPost.UserId != userId)
            {
                AddError("You are not authorized to update this room post.");
                return null;
            }

            roomPost = updateModel.MapForUpdate(roomPost);

            // Fix deposit consistency
            if (roomPost.DepositAmount.HasValue && roomPost.DepositAmount <= 0)
            {
                roomPost.DepositAmount = null;
                roomPost.DepositExists = false;
            }
            else if (roomPost.DepositAmount.HasValue && roomPost.DepositAmount > 0)
            {
                roomPost.DepositExists = true;
            }
            roomPost.StatusCode = StatusConstants.UpdatedStatusCode;
            roomPost.ModifiedUserId = userId.Value;
            roomPost.ModifiedDateTime = DateTime.UtcNow;

            await unitOfWork.RoomPostRepository().Update(roomPost);
            await unitOfWork.SaveChanges(); 
            return "Room post updated successfully.";

        }


        public async Task<string?> AddContentAsync(long roomPostId, List<IFormFile> files)
        {
            var userId = userHelper.GetUserId();
            if (!userId.HasValue)
            {
                AddError("User not found");
                return null;
            }

            var (roomPost, isExists) = await CheckRoomPostExists(roomPostId, false);

            if (!isExists)
            {
                AddError($"Room post with id {roomPostId} does not exist");
                return null;
            }
            if(roomPost!.UserId != userId)
            {
                AddError("The logged user is not authorized to update this room post");
                return null;
            }

            var hasCover = await unitOfWork.RoomPostContentRepository()
                .GetAll().AnyAsync(x => x.RoomPostId == roomPostId && x.IsCover);

            var roomPostContents = new List<RoomPostContent>();

            var coverAssigned = hasCover;

            foreach(var file in files)
            {
                var contentId = await contentService.CreateContentForImage(file, "room-posts");
                if(contentId == null)
                {
                    AddError($"Content could not be created for the file : {file.FileName}");
                    return null;
                }

                roomPostContents.Add(new RoomPostContent
                {
                    RoomPostId = roomPostId,
                    ContentId = contentId.Value,
                    IsCover = !coverAssigned,
                    CreatedUserId = userId.Value,
                    CreatedDateTime = DateTime.UtcNow,

                });
                coverAssigned = true;
            }

            
            unitOfWork.RoomPostContentRepository().AddRange(roomPostContents);
            roomPost.StatusCode = StatusConstants.ActiveStatusCode;

            await unitOfWork.RoomPostRepository().Update(entity: roomPost);
            await unitOfWork.SaveChanges();
            return "Room Post Content created successfully";
        }


        //public async Task<RoomPostContentDto?> GetRoomPostContent(int roomPostId)
        //{
        //    var (roomPost, isExists) = await CheckRoomPostExists(roomPostId, true);

        //    if (!isExists)
        //    {
        //        AddError($"Room post with id {roomPostId} does not exist");
        //        return null;
        //    }


        //}

        private async Task<(RoomPost? roomPost, bool isExist)> CheckRoomPostExists(long id, bool includeContent = false)
        {
            IQueryable<RoomPost> query;

            if (includeContent)
            {
                query = unitOfWork.RoomPostRepository()
                    .GetAll(b => b.Region!, b => b.RoomPostType!, b => b.RoomType!,
                            b => b.User!, b => b.ForGender, b => b.CurrencyType!, b => b.Status!)
                    .Include(r => r.RoomPostContents).ThenInclude(c=>c.Content);       // ✅ the fix — loads FileId
            }
            else
            {
                query = unitOfWork.RoomPostRepository().GetAll(b => b.Status!);
            }

            var currentUserId = userHelper.GetUserId();

            Console.WriteLine($"Looking for roomPostId: {id}");
            Console.WriteLine($"currentUserId: {currentUserId}");

            if (currentUserId is null)
            {
                AddError("User not found.");
                return (null, false);
            }


            Console.WriteLine($"Query params - id: {id}, currentUserId: {currentUserId}");
            var sql = query.Where(r => r.Id == id &&
                ((r.UserId == currentUserId.Value && r.StatusCode != StatusConstants.DeletedStatusCode)
                || (r.UserId != currentUserId.Value && r.StatusCode == StatusConstants.ActiveStatusCode)))
                .ToQueryString(); // ← EF Core method that shows actual SQL with params
            Console.WriteLine(sql);

            var roomPost = await query
                .Where(r => r.Id == id &&
                (
                    (r.UserId == currentUserId.Value && r.StatusCode != StatusConstants.DeletedStatusCode)
                    ||
                    (r.UserId != currentUserId.Value && r.StatusCode == StatusConstants.ActiveStatusCode)
                ))
                .FirstOrDefaultAsync();


            
            Console.WriteLine($"roomPost found: {roomPost != null}");

            if (roomPost is null)
            {
                AddError("Room post not found!");
                return (null, false);
            }

            return (roomPost, true);
        }



        public Task<string?> ActivateAsync(long id) =>
            UpdateStatusAsync(id, StatusConstants.ActiveStatusCode, "Activated");

        public  Task<string?> DeactivateAsync(long id) =>
            UpdateStatusAsync(id, StatusConstants.PassiveStatusCode, "Deactivated");

        //public override Task<string?> ActivateAsync(long id) =>
        //    UpdateStatusAsync(id, StatusConstants.ArchivedStatusCode, "Archived");

        public  Task<string?> DeleteAsync(long id) =>
            UpdateStatusAsync(id, StatusConstants.DeletedStatusCode, "Deleted");

        //public override Task<string?> ActivateAsync(long id) =>
        //    UpdateStatusAsync(id, StatusConstants.UpdatedStatusCode, "Updated");

        private async Task<string?> UpdateStatusAsync(long id, int targetStatusCode, string message)
        {
            var (roomPost, isExist) = await CheckRoomPostExists(id);

            var userId = userHelper.GetUserId();

            if (!userId.HasValue)
            {
                AddError("User not found.");
                return null;
            }


            if (roomPost == null)
            {
                AddError("Room post not found.");
                return null;
            }


            if (userId != roomPost.UserId)
            {
                AddError("You are not authorized to change the status of this room post.");
                return null;
            }

            if (!CanApply(roomPost.StatusCode, targetStatusCode))
            {
                AddError($"Cannot change status from {roomPost.StatusCode} to {targetStatusCode}.");
                return null;
            }


            roomPost.StatusCode = targetStatusCode;
            roomPost.ModifiedDateTime = DateTime.UtcNow;
            roomPost.ModifiedUserId = userId.Value;
            await unitOfWork.RoomPostRepository().Update(roomPost);
            await unitOfWork.SaveChanges();
            return message;

        }


        private bool CanApply(int currentStatusCode, int targetStatusCode)
        {
            bool canApply = StatusConstants.CanApply(currentStatusCode, targetStatusCode);

            if (!canApply)
            {
                return false;
            }
            
            return true;
        }

        private static TypeAdapterConfig GetCustomConfig()
        {
            var config = new TypeAdapterConfig();
            config.NewConfig<RoomPost, RoomPostDto>()
                .Map(dest => dest.Username, src => src.User!.Username)
                .Map(dest => dest.StatusName, src => src.Status!.FullName)
                .Map(dest => dest.CurrencyName, src => src.CurrencyType!.FullName)
                .Map(dest => dest.RoomPostName, src => src.RoomPostType!.FullName)
                .Map(dest => dest.RoomTypeName, src => src.RoomType!.FullName)
                .Map(dest => dest.RegionName, src => src.Region!.FullName)
                .Map(dest => dest.OwnerId, src => src.User!.Id)
                .Map(dest => dest.ForGenderName, src => src.ForGender != null ? src.ForGender.FullName : null)
                .Map(dest => dest.CoverImageUrl,
            src => src.RoomPostContents
        .Where(x => x.IsCover && x.Content != null)
        .Select(x => x.Content!.FileId)
        .FirstOrDefault());
               

            return config;
        }

        public async Task<PaginationModel<RoomPostDto>?> GetUserPosts(RoomPostFilterOptions filters)
        {

            var userId = userHelper.GetUserId();
            if(userId == null)
            {
                AddError("User not found");
                return null;
            }



            var query = (unitOfWork.RoomPostRepository().GetAll(r => r.User!, r => r.Status!, r => r.CurrencyType!, r => r.RoomPostType!, r => r.RoomType!, r => r.Region!, r => r.ForGender, r => r.RoomPostContents))
                .Where((r => r.StatusCode != StatusConstants.DeletedStatusCode && r.UserId ==userId.Value));

            query = query.Include(r => r.RoomPostContents.Where(x => x.IsCover));

            var congig = GetCustomConfig();

            var result = query.ApplyFilter(filters)

                .ProjectToType<RoomPostDto>(congig)
                .ToPaginationModel(page: filters.Page, filters.PageSize);

            foreach (var item in result.Rows)
            {
                if (Guid.TryParse(item.CoverImageUrl, out var fileId))
                {
                    item.CoverImageUrl = fileId.GetFileUrl();
                }

                foreach (var content in item.RoomPostContents)
                {
                    if (content.ContentId != null)
                    {
                        content.Url = content.ContentId.ToString().GetFileUrl();
                    }
                }
            }

            return result;
        }

        public async Task<string?> DeleteContentAsync(long roomPostId, long contentId)
        {
            var userId = userHelper.GetUserId();
            if (!userId.HasValue)
            {
                AddError("User not found");
                return null;
            }

            var roomPostContent = await unitOfWork.RoomPostContentRepository()
                .GetAll(c => c.Content!)
                .FirstOrDefaultAsync(c => c.RoomPostId == roomPostId && c.Id == contentId);

            if (roomPostContent == null)
            {
                AddError("Content not found");
                return null;
            }

            var roomPost = await unitOfWork.RoomPostRepository()
                .GetAll()
                .FirstOrDefaultAsync(r => r.Id == roomPostId && r.UserId == userId.Value);

            if (roomPost == null)
            {
                AddError("You are not authorized to delete this content");
                return null;
            }

            // If deleting cover, assign cover to next available content
            if (roomPostContent.IsCover)
            {
                var nextContent = await unitOfWork.RoomPostContentRepository()
                    .GetAll()
                    .FirstOrDefaultAsync(c => c.RoomPostId == roomPostId && c.Id != contentId);

                if (nextContent != null)
                {
                    nextContent.IsCover = true;
                    await unitOfWork.RoomPostContentRepository().Update(nextContent);
                }
            }

            await contentService.DeleteContentForImage(roomPostContent.ContentId);
            await unitOfWork.RoomPostContentRepository().Delete(roomPostContent);
            await unitOfWork.SaveChanges();

            return "Content deleted successfully";
        }

        public async Task<string?> SetCoverAsync(long roomPostId, long contentId)
        {
            var userId = userHelper.GetUserId();
            if (!userId.HasValue)
            {
                AddError("User not found");
                return null;
            }

            var roomPost = await unitOfWork.RoomPostRepository()
                .GetAll()
                .FirstOrDefaultAsync(r => r.Id == roomPostId && r.UserId == userId.Value);

            if (roomPost == null)
            {
                AddError("You are not authorized to update this room post");
                return null;
            }

            // Remove current cover
            var currentCover = await unitOfWork.RoomPostContentRepository()
                .GetAll()
                .FirstOrDefaultAsync(c => c.RoomPostId == roomPostId && c.IsCover);

            if (currentCover != null)
            {
                currentCover.IsCover = false;
                await unitOfWork.RoomPostContentRepository().Update(currentCover);
            }

            // Set new cover
            var newCover = await unitOfWork.RoomPostContentRepository()
                .GetAll()
                .FirstOrDefaultAsync(c => c.RoomPostId == roomPostId && c.Id == contentId);

            if (newCover == null)
            {
                AddError("Content not found");
                return null;
            }

            newCover.IsCover = true;
            await unitOfWork.RoomPostContentRepository().Update(newCover);
            await unitOfWork.SaveChanges();

            return "Cover updated successfully";
        }
    }
}
