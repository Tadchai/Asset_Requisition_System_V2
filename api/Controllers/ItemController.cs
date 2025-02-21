using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Models;
using api.ViewModels;
using Humanizer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;

namespace api.Controllers
{
    [ApiController]
    [Route("[controller]/[action]")]
    [Authorize]
    public class ItemController : ControllerBase
    {
        private readonly EquipmentBorrowingV2Context _context;

        public ItemController(EquipmentBorrowingV2Context context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetCategory()
        {
            try
            {
                var query = from c in _context.Categories
                            select new CategoryResponse
                            {
                                CategoryId = c.CategoryId,
                                CategoryName = c.Name,
                                Description = c.Description
                            };

                var result = await query.ToListAsync();

                return new JsonResult(result);
            }
            catch (Exception ex)
            {
                return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
            }
        }

        [HttpPost]
        public async Task<IActionResult> GetCategory([FromBody] GetCategoryRequest request)
        {
            try
            {
                var query = from c in _context.Categories
                            orderby c.CategoryId
                            select new CategoryResponse
                            {
                                CategoryId = c.CategoryId,
                                CategoryName = c.Name,
                                Description = c.Description,
                                Unit = c.Unit,
                                ReservedQuantity = c.ReservedQuantity,
                            };

                int itemTotal = await query.CountAsync();
                int countBefore = 0, countAfter = 0;
                var queryWithFilter = query;
                if (request.NextCursor.HasValue)
                {
                    query = query.Where(r => r.CategoryId > request.NextCursor);
                }
                else if (request.PreviousCursor.HasValue)
                {
                    query = query.Where(r => r.CategoryId < request.PreviousCursor)
                                    .OrderByDescending(r => r.CategoryId);
                }

                List<CategoryResponse> result;
                if (request.PreviousCursor.HasValue)
                {
                    var queryWithTake = query.Take(request.PageSize);
                    result = await queryWithTake.ToListAsync();
                    result.Reverse();
                }
                else
                {
                    result = await query.Take(request.PageSize).ToListAsync();
                }
                var firstId = result.First().CategoryId;
                var lastId = result.Last().CategoryId;
                countBefore = await queryWithFilter.Where(r => r.CategoryId < firstId).CountAsync();
                countAfter = await queryWithFilter.Where(r => r.CategoryId > lastId).CountAsync();
                int rowCount = result.Count;

                return new JsonResult(new PaginatedResponse<List<CategoryResponse>>
                {
                    ItemTotal = itemTotal,
                    TotalRow = rowCount,
                    PreviousCursor = firstId,
                    NextCursor = lastId,
                    TotalBefore = countBefore,
                    TotalAfter = countAfter,
                    Data = result,
                });
            }
            catch (Exception ex)
            {
                return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetCategoryById([FromQuery] int categoryId)
        {
            try
            {
                var query = from c in _context.Categories
                            where c.CategoryId == categoryId
                            select new CategoryResponse
                            {
                                CategoryName = c.Name,
                                Description = c.Description,
                                Unit = c.Unit,
                                ReservedQuantity = c.ReservedQuantity
                            };

                var result = await query.SingleAsync();

                return new JsonResult(result);
            }
            catch (Exception ex)
            {
                return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetClassification()
        {
            try
            {
                var query = from cs in _context.Classifications
                            join c in _context.Categories on cs.CategoryId equals c.CategoryId
                            select new ClassificationResponse
                            {
                                ClassificationId = cs.ClassificationId,
                                CategoryName = c.Name,
                                ClassificationName = cs.Name,
                                Description = cs.Description
                            };

                var result = await query.ToListAsync();

                return new JsonResult(result);
            }
            catch (Exception ex)
            {
                return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
            }
        }

        [HttpPost]
        public async Task<IActionResult> GetClassification([FromBody] GetClassificationRequest request)
        {
            try
            {
                var query = from cs in _context.Classifications
                            join c in _context.Categories on cs.CategoryId equals c.CategoryId
                            orderby cs.ClassificationId
                            select new ClassificationResponse
                            {
                                CategoryId = cs.CategoryId,
                                ClassificationId = cs.ClassificationId,
                                CategoryName = c.Name,
                                ClassificationName = cs.Name,
                                Description = cs.Description
                            };

                if (request.CategoryId.HasValue)
                    query = query.Where(r => r.CategoryId == request.CategoryId);

                int itemTotal = await query.CountAsync();
                int countBefore = 0, countAfter = 0;
                var queryWithFilter = query;
                if (request.NextCursor.HasValue)
                {
                    query = query.Where(r => r.ClassificationId > request.NextCursor);
                }
                else if (request.PreviousCursor.HasValue)
                {
                    query = query.Where(r => r.ClassificationId < request.PreviousCursor)
                                    .OrderByDescending(r => r.ClassificationId);
                }

                List<ClassificationResponse> result;
                if (request.PreviousCursor.HasValue)
                {
                    var queryWithTake = query.Take(request.PageSize);
                    result = await queryWithTake.ToListAsync();
                    result.Reverse();
                }
                else
                {
                    result = await query.Take(request.PageSize).ToListAsync();
                }
                var firstId = result.First().ClassificationId;
                var lastId = result.Last().ClassificationId;
                countBefore = await queryWithFilter.Where(r => r.ClassificationId < firstId).CountAsync();
                countAfter = await queryWithFilter.Where(r => r.ClassificationId > lastId).CountAsync();
                int rowCount = result.Count;

                return new JsonResult(new PaginatedResponse<List<ClassificationResponse>>
                {
                    ItemTotal = itemTotal,
                    TotalRow = rowCount,
                    PreviousCursor = firstId,
                    NextCursor = lastId,
                    TotalBefore = countBefore,
                    TotalAfter = countAfter,
                    Data = result,
                });
            }
            catch (Exception ex)
            {
                return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetClassificationById([FromQuery] int classificationId)
        {
            try
            {
                var query = from cs in _context.Classifications
                            join c in _context.Categories on cs.CategoryId equals c.CategoryId
                            where cs.ClassificationId == classificationId
                            select new ClassificationResponse
                            {
                                CategoryName = c.Name,
                                ClassificationName = cs.Name,
                                Description = cs.Description
                            };

                var result = await query.SingleAsync();

                return new JsonResult(result);
            }
            catch (Exception ex)
            {
                return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
            }
        }

        [HttpPost]
        public async Task<IActionResult> GetInstance([FromBody] GetInstancRequest request)
        {
            try
            {
                var query = from i in _context.Instances
                            join cs in _context.Classifications on i.ClassificationId equals cs.ClassificationId
                            join c in _context.Categories on cs.CategoryId equals c.CategoryId
                            orderby i.InstanceId
                            select new InstanceResponse
                            {
                                InstanceId = i.InstanceId,
                                CategoryName = c.Name,
                                ClassificationName = cs.Name,
                                AssetId = i.AssetId
                            };

                int itemTotal = await query.CountAsync();
                int countBefore = 0, countAfter = 0;
                var queryWithFilter = query;
                if (request.NextCursor.HasValue)
                {
                    query = query.Where(r => r.InstanceId > request.NextCursor);
                }
                else if (request.PreviousCursor.HasValue)
                {
                    query = query.Where(r => r.InstanceId < request.PreviousCursor)
                                    .OrderByDescending(r => r.InstanceId);
                }

                List<InstanceResponse> result;
                if (request.PreviousCursor.HasValue)
                {
                    var queryWithTake = query.Take(request.PageSize);
                    result = await queryWithTake.ToListAsync();
                    result.Reverse();
                }
                else
                {
                    result = await query.Take(request.PageSize).ToListAsync();
                }
                var firstId = result.First().InstanceId;
                var lastId = result.Last().InstanceId;
                countBefore = await queryWithFilter.Where(r => r.InstanceId < firstId).CountAsync();
                countAfter = await queryWithFilter.Where(r => r.InstanceId > lastId).CountAsync();
                int rowCount = result.Count;

                return new JsonResult(new PaginatedResponse<List<InstanceResponse>>
                {
                    ItemTotal = itemTotal,
                    TotalRow = rowCount,
                    PreviousCursor = firstId,
                    NextCursor = lastId,
                    TotalBefore = countBefore,
                    TotalAfter = countAfter,
                    Data = result,
                });
            }
            catch (Exception ex)
            {
                return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetInstanceById([FromQuery] int instanceId)
        {
            try
            {
                var query = from i in _context.Instances
                            join cs in _context.Classifications on i.ClassificationId equals cs.ClassificationId
                            join c in _context.Categories on cs.CategoryId equals c.CategoryId
                            where i.InstanceId == instanceId
                            select new InstanceResponse
                            {
                                CategoryName = c.Name,
                                ClassificationName = cs.Name,
                                AssetId = i.AssetId,
                                Price = i.Price,
                                AcquisitonDate = i.AcquisitonDate,
                                StoreName = i.StoreName,
                                Preparation = i.Preparation
                            };

                var result = await query.SingleAsync();

                return new JsonResult(result);
            }
            catch (Exception ex)
            {
                return new JsonResult(new MessageResponse
                {
                    Message = $"An error occurred: {ex.Message}",
                    StatusCode = HttpStatusCode.InternalServerError
                });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryRequest request)
        {
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    var categoryModel = new Category
                    {
                        Name = request.Name,
                        Description = request.Description,
                        Unit = request.Unit,
                        ReservedQuantity = request.ReservedQuantity
                    };
                    await _context.Categories.AddAsync(categoryModel);
                    await _context.SaveChangesAsync();

                    await transaction.CommitAsync();
                    return new JsonResult(new MessageResponse { Message = "Category Created successfully.", StatusCode = HttpStatusCode.Created });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
                }
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateClassification([FromBody] CreateClassificationRequest request)
        {
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    var classificationModel = new Classification
                    {
                        Name = request.Name,
                        Description = request.Description,
                        CategoryId = request.CategoryId
                    };
                    await _context.Classifications.AddAsync(classificationModel);
                    await _context.SaveChangesAsync();

                    await transaction.CommitAsync();
                    return new JsonResult(new MessageResponse { Message = "Classification Created successfully.", StatusCode = HttpStatusCode.Created });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
                }
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateInstance([FromBody] CreateInstanceRequest request)
        {
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    var instanceModel = new Instance
                    {
                        AssetId = request.AssetId,
                        Status = (int)InstanceStatus.Available,
                        ClassificationId = request.ClassificationId,
                        Price = request.Price,
                        AcquisitonDate = request.AcquisitonDate,
                        StoreName = request.StoreName,
                        Preparation = request.Preparation
                    };
                    await _context.Instances.AddAsync(instanceModel);
                    await _context.SaveChangesAsync();

                    var TimelineModel = new ItemInstanceStatusTimeline
                    {
                        ItemInstanceId = instanceModel.InstanceId,
                        StatusChange = (int)TimelineStatusChange.Add,
                        Date = DateOnly.FromDateTime(DateTime.Now)
                    };
                    await _context.ItemInstanceStatusTimelines.AddAsync(TimelineModel);
                    await _context.SaveChangesAsync();

                    await transaction.CommitAsync();
                    return new JsonResult(new MessageResponse { Message = "Instance Created successfully.", StatusCode = HttpStatusCode.Created });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
                }
            }
        }

        [HttpPost]
        public async Task<IActionResult> UpdateCategory([FromBody] UpdateCategoryRequest request)
        {
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    var categoryModel = await _context.Categories.SingleAsync(c => c.CategoryId == request.CategoryId);
                    categoryModel.Name = request.Name;
                    categoryModel.Description = request.Description;
                    categoryModel.Unit = request.Unit;
                    categoryModel.ReservedQuantity = request.ReservedQuantity;

                    await _context.SaveChangesAsync();

                    await transaction.CommitAsync();
                    return new JsonResult(new MessageResponse { Message = "Category Updated successfully.", StatusCode = HttpStatusCode.Created });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
                }
            }
        }

        [HttpPost]
        public async Task<IActionResult> UpdateClassification([FromBody] UpdateClassificationRequest request)
        {
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    var classificationModel = await _context.Classifications.SingleAsync(c => c.ClassificationId == request.ClassificationId);
                    classificationModel.Name = request.Name;
                    classificationModel.Description = request.Description;

                    await _context.SaveChangesAsync();

                    await transaction.CommitAsync();
                    return new JsonResult(new MessageResponse { Message = "Classification Updated successfully.", StatusCode = HttpStatusCode.Created });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
                }
            }
        }

        [HttpPost]
        public async Task<IActionResult> UpdateInstance([FromBody] UpdateInstanceRequest request)
        {
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    var instanceModel = await _context.Instances.SingleAsync(c => c.InstanceId == request.InstanceId);
                    instanceModel.Price = request.Price;
                    instanceModel.StoreName = request.StoreName;
                    instanceModel.Preparation = request.Preparation;

                    await _context.SaveChangesAsync();

                    await transaction.CommitAsync();
                    return new JsonResult(new MessageResponse { Message = "Instance Updated successfully.", StatusCode = HttpStatusCode.Created });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
                }
            }
        }

        [HttpPost]
        public async Task<IActionResult> GetAssetId([FromBody] GetAssetIdRequest request)
        {
            try
            {
                var query = from c in _context.Categories
                            join cs in _context.Classifications on c.CategoryId equals cs.CategoryId
                            join i in _context.Instances on cs.ClassificationId equals i.ClassificationId
                            join x in from r in _context.RequisitionRequests
                                      join u in _context.Users on r.RequesterId equals u.UserId
                                      select new
                                      {
                                          r.RequestId,
                                          u.UserId,
                                          u.FirstName,
                                          u.LastName,
                                      } on i.RequestId equals x.RequestId into xJoin
                            from x in xJoin.DefaultIfEmpty()
                            orderby i.InstanceId
                            select new GetAssetIdResponse
                            {
                                CategoryId = c.CategoryId,
                                CategoryName = c.Name,
                                ClassificationName = cs.Name,
                                AssetId = i.AssetId,
                                UserId = x.UserId,
                                FirstName = x.FirstName,
                                LastName = x.LastName,
                                Status = i.Status,
                                InstanceId = i.InstanceId,
                                AcquisitonDate = i.AcquisitonDate
                            };

                if (!string.IsNullOrWhiteSpace(request.AssetId))
                    query = query.Where(r => r.AssetId.ToLower().Contains(request.AssetId.ToLower()));

                if (request.UserId.HasValue)
                    query = query.Where(r => r.UserId == request.UserId);

                if (request.CategoryId.HasValue)
                    query = query.Where(r => r.CategoryId == request.CategoryId);

                if (request.Status.HasValue)
                    query = query.Where(r => r.Status == request.Status.Value);

                if (request.StartDate.HasValue || request.EndDate.HasValue)
                    query = query.Where(r => (!request.StartDate.HasValue || r.AcquisitonDate >= request.StartDate) && (!request.EndDate.HasValue || r.AcquisitonDate <= request.EndDate));


                int itemTotal = await query.CountAsync();
                int countBefore = 0, countAfter = 0;
                var queryWithFilter = query;
                if (request.NextCursor.HasValue)
                {
                    query = query.Where(r => r.InstanceId > request.NextCursor);
                }
                else if (request.PreviousCursor.HasValue)
                {
                    query = query.Where(r => r.InstanceId < request.PreviousCursor)
                                    .OrderByDescending(r => r.InstanceId);
                }

                List<GetAssetIdResponse> result;
                if (request.PreviousCursor.HasValue)
                {
                    var queryWithTake = query.Take(request.PageSize);
                    result = await queryWithTake.ToListAsync();
                    result.Reverse();
                }
                else
                {
                    result = await query.Take(request.PageSize).ToListAsync();
                }
                var firstId = result.First().InstanceId;
                var lastId = result.Last().InstanceId;
                countBefore = await queryWithFilter.Where(r => r.InstanceId < firstId).CountAsync();
                countAfter = await queryWithFilter.Where(r => r.InstanceId > lastId).CountAsync();
                int rowCount = result.Count;

                return new JsonResult(new PaginatedResponse<List<GetAssetIdResponse>>
                {
                    ItemTotal = itemTotal,
                    TotalRow = rowCount,
                    PreviousCursor = firstId,
                    NextCursor = lastId,
                    TotalBefore = countBefore,
                    TotalAfter = countAfter,
                    Data = result,
                });
            }
            catch (Exception ex)
            {
                return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAssetIdById([FromQuery] int instanceId)
        {
            try
            {
                var query = from c in _context.Categories
                            join cs in _context.Classifications on c.CategoryId equals cs.CategoryId
                            join i in _context.Instances on cs.ClassificationId equals i.ClassificationId
                            join x in from r in _context.RequisitionRequests
                                      join u in _context.Users on r.RequesterId equals u.UserId
                                      select new
                                      {
                                          r.RequestId,
                                          u.FirstName,
                                          u.LastName
                                      } on i.RequestId equals x.RequestId into xJoin
                            from x in xJoin.DefaultIfEmpty()
                            where i.InstanceId == instanceId
                            select new GetAssetIdByIdResponse
                            {
                                CategoryName = c.Name,
                                CategoryDescription = c.Description,
                                ClassificationName = cs.Name,
                                ClassificationDescription = cs.Description,
                                AssetId = i.AssetId,
                                FirstName = x.FirstName,
                                LastName = x.LastName,
                                Status = i.Status,
                                InstanceId = i.InstanceId,
                                AcquisitonDate = i.AcquisitonDate,
                                StoreName = i.StoreName,
                                Price = i.Price,
                                Preparation = i.Preparation
                            };

                var result = await query.SingleAsync();

                return new JsonResult(result);
            }
            catch (Exception ex)
            {
                return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
            }
        }

        [HttpPost]
        public async Task<IActionResult> SetAssetId([FromBody] SetAssetIdRequest request)
        {
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    var instanceModel = await _context.Instances.SingleAsync(i => i.InstanceId == request.InstanceId);
                    if (request.Status == InstanceStatus.EndOfLife)
                    {
                        if (instanceModel.RequestId != null)
                            return new JsonResult(new MessageResponse { Message = "Unreturned items cannot be set.", StatusCode = HttpStatusCode.BadRequest });
                        instanceModel.Status = (int)InstanceStatus.EndOfLife;

                        var TimelineModel = new ItemInstanceStatusTimeline
                        {
                            ItemInstanceId = request.InstanceId,
                            StatusChange = (int)TimelineStatusChange.EndOfLife,
                            Date = DateOnly.FromDateTime(DateTime.Now)
                        };
                        await _context.ItemInstanceStatusTimelines.AddAsync(TimelineModel);
                    }
                    else if (request.Status == InstanceStatus.Missing)
                    {
                        instanceModel.Status = (int)InstanceStatus.Missing;

                        var TimelineModel = new ItemInstanceStatusTimeline
                        {
                            ItemInstanceId = request.InstanceId,
                            StatusChange = (int)TimelineStatusChange.Missing,
                            Date = DateOnly.FromDateTime(DateTime.Now)
                        };
                        await _context.ItemInstanceStatusTimelines.AddAsync(TimelineModel);
                    }
                    else
                    {
                        var checkRequestCompleted = await (from i in _context.Instances
                                                           join r in _context.RequisitionRequests on i.RequestId equals r.RequestId
                                                           where r.Status == (int)RequestStatus.Allocated && i.InstanceId == request.InstanceId
                                                           select i)
                                                            .AnyAsync();
                        if (checkRequestCompleted)
                            return new JsonResult(new MessageResponse { Message = "Request not Completed, Cannot recall Asset", StatusCode = HttpStatusCode.BadRequest });

                        instanceModel.RequestId = null;

                        var TimelineModel = new ItemInstanceStatusTimeline
                        {
                            ItemInstanceId = request.InstanceId,
                            StatusChange = (int)TimelineStatusChange.Recall,
                            Date = DateOnly.FromDateTime(DateTime.Now)
                        };
                        await _context.ItemInstanceStatusTimelines.AddAsync(TimelineModel);
                    }

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();
                    return new JsonResult(new MessageResponse { Message = "AssetId Status Updated  successfully.", StatusCode = HttpStatusCode.OK });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
                }
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetFreeInstance()
        {
            try
            {
                var query = from i in _context.Instances
                            join cs in _context.Classifications on i.ClassificationId equals cs.ClassificationId
                            join c in _context.Categories on cs.CategoryId equals c.CategoryId
                            where i.RequestId == null && i.Status == (int)InstanceStatus.Available
                            select new InstanceResponse
                            {
                                InstanceId = i.InstanceId,
                                CategoryName = c.Name,
                                ClassificationName = cs.Name,
                                AssetId = i.AssetId
                            };

                var result = await query.ToListAsync();

                return new JsonResult(result);
            }
            catch (Exception ex)
            {
                return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetCountInstance()
        {
            try
            {
                var query = from i in _context.Instances
                            join cs in _context.Classifications on i.ClassificationId equals cs.ClassificationId
                            join c in _context.Categories on cs.CategoryId equals c.CategoryId
                            where i.Status == (int)InstanceStatus.Available
                            let IsInUsed = i.RequestId != null
                            select new
                            {
                                CategoryName = c.Name,
                                ReservedQuantity = c.ReservedQuantity,
                                IsInUsed
                            };

                var datalist = await query.ToListAsync();

                var result = datalist.GroupBy(x => x.CategoryName)
                                    .Select(g => new CountInstanceResponse
                                    {
                                        CategoryName = g.Key,
                                        ReservedQuantity = g.First().ReservedQuantity,
                                        TotalInstances = g.Count(),
                                        TotalInUsed = g.Count(i => i.IsInUsed),
                                    }).ToList();

                return new JsonResult(result);
            }
            catch (Exception ex)
            {
                return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
            }
        }

        [HttpPost]
        public async Task<IActionResult> GetBackupEfficiency([FromBody] GetBackupEfficiencyRequest request)
        {
            try
            {
                var query = from t in _context.ItemInstanceStatusTimelines
                            join i in _context.Instances on t.ItemInstanceId equals i.InstanceId
                            where i.Preparation == true &&
                                  i.Status != (int)InstanceStatus.EndOfLife &&
                                  i.Status != (int)InstanceStatus.Missing
                            select new
                            {
                                ItemInstanceId = t.ItemInstanceId,
                                StatusChange = t.StatusChange,
                                Date = t.Date,
                                InstanceAcquisitonDate = i.AcquisitonDate
                            };

                if (request.StartDate.HasValue || request.EndDate.HasValue)
                    query = query.Where(r => (!request.StartDate.HasValue || r.InstanceAcquisitonDate >= request.StartDate) && (!request.EndDate.HasValue || r.InstanceAcquisitonDate <= request.EndDate));

                var dataList = await query.ToListAsync();

                var resultWithId = dataList.GroupBy(x => x.ItemInstanceId)
                                    .Select(g =>
                                    {
                                        List<(string StartStatus, DateTime Start, DateTime End)> Data = [];
                                        DateTime? startDate = null;
                                        string startStatus = "";

                                        foreach (var record in g)
                                        {
                                            if (record.StatusChange == (int)TimelineStatusChange.Add || record.StatusChange == (int)TimelineStatusChange.Return || record.StatusChange == (int)TimelineStatusChange.Recall)
                                            {
                                                startDate = record.Date.ToDateTime(TimeOnly.MinValue);
                                                startStatus = record.StatusChange switch
                                                {
                                                    (int)TimelineStatusChange.Add => "Add",
                                                    (int)TimelineStatusChange.Return => "Return",
                                                    (int)TimelineStatusChange.Recall => "Recall"
                                                };
                                            }
                                            else if (record.StatusChange == (int)TimelineStatusChange.Request && startDate.HasValue)
                                            {
                                                DateTime endDate = record.Date.ToDateTime(TimeOnly.MinValue);
                                                Data.Add((startStatus, startDate.Value, endDate));
                                                startDate = null;
                                            }
                                        }

                                        if (!Data.Any() && startDate.HasValue)
                                        {
                                            DateTime today = DateTime.Today;
                                            Data.Add((startStatus, startDate.Value, today));
                                        }

                                        return new
                                        {
                                            InstanceId = g.Key,
                                            AverageEfficiency = Data.Any() ? Data.Average(x => (x.End - x.Start).TotalDays) : 0
                                        };
                                    }).ToList();

                var queryCategoryName = from i in _context.Instances
                                        join cs in _context.Classifications on i.ClassificationId equals cs.ClassificationId
                                        join c in _context.Categories on cs.CategoryId equals c.CategoryId
                                        where resultWithId.Select(x => x.InstanceId).Contains(i.InstanceId)
                                        select new
                                        {
                                            CategoryName = c.Name,
                                            InstanceId = i.InstanceId
                                        };
                var resultWithName = await queryCategoryName.ToListAsync();

                var result = (from r in resultWithId
                              join n in resultWithName on r.InstanceId equals n.InstanceId
                              group r by n.CategoryName into g
                              select new
                              {
                                  CategoryName = g.Key,
                                  AverageEfficiency = g.Average(x => x.AverageEfficiency)
                              }).ToList();

                return new JsonResult(result);
            }
            catch (Exception ex)
            {
                return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
            }
        }

        [HttpPost]
        public async Task<IActionResult> GetProportionOfAsset([FromBody] GetProportionOfAssetRequest request)
        {
            try
            {
                var query = from i in _context.Instances
                            join cs in _context.Classifications on i.ClassificationId equals cs.ClassificationId
                            join c in _context.Categories on cs.CategoryId equals c.CategoryId
                            where i.Status == (int)InstanceStatus.Available
                            let IsInUsed = i.RequestId != null
                            select new
                            {
                                InstanceId = i.InstanceId,
                                c.ReservedQuantity,
                                IsInUsed,
                                InstanceAcquisitonDate = i.AcquisitonDate
                            };

                if (request.StartDate.HasValue || request.EndDate.HasValue)
                    query = query.Where(r => (!request.StartDate.HasValue || r.InstanceAcquisitonDate >= request.StartDate) && (!request.EndDate.HasValue || r.InstanceAcquisitonDate <= request.EndDate));

                var dataList = await query.ToListAsync();

                var queryCategoryName = from i in _context.Instances
                                        join cs in _context.Classifications on i.ClassificationId equals cs.ClassificationId
                                        join c in _context.Categories on cs.CategoryId equals c.CategoryId
                                        where dataList.Select(x => x.InstanceId).Contains(i.InstanceId)
                                        select new
                                        {
                                            CategoryName = c.Name,
                                            InstanceId = i.InstanceId
                                        };
                var resultWithName = await queryCategoryName.ToListAsync();

                var result = (from r in dataList
                              join n in resultWithName on r.InstanceId equals n.InstanceId
                              group r by n.CategoryName into g
                              let totalInUsed = g.Sum(x => x.IsInUsed ? 1 : 0)
                              let totalCount = g.Count()
                              let reservedQuantity = g.First().ReservedQuantity
                              select new
                              {
                                  CategoryName = g.Key,
                                  TotalInUsed = totalInUsed,
                                  ReservedCount = Math.Min(totalCount - totalInUsed, reservedQuantity),
                                  OverReservedCount = Math.Max(0, totalCount - totalInUsed - reservedQuantity)
                              }).ToList();

                return new JsonResult(result);
            }
            catch (Exception ex)
            {
                return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
            }
        }

        [HttpPost]
        public async Task<IActionResult> GetTimetoAllocate([FromBody] GetTimetoAllocateRequest request)
        {
            try
            {
                var query = from h in _context.Histories
                            join r in _context.RequisitionRequests on h.RequestId equals r.RequestId
                            join i in _context.Instances on r.InstanceId equals i.InstanceId
                            where h.ResponseRequestDate != null
                            select new
                            {
                                InstanceId = r.InstanceId,
                                RequestDate = h.RequestDate,
                                AllocateDate = h.ResponseRequestDate,
                                DueDate = r.DueDate,
                                InstanceAcquisitonDate = i.AcquisitonDate
                            };

                if (request.StartDate.HasValue || request.EndDate.HasValue)
                    query = query.Where(r => (!request.StartDate.HasValue || r.InstanceAcquisitonDate >= request.StartDate) && (!request.EndDate.HasValue || r.InstanceAcquisitonDate <= request.EndDate));

                var dataList = await query.ToListAsync();

                var resultWithId = dataList
                                    .Select(x => new
                                    {
                                        x.InstanceId,
                                        TimeLate = (x.AllocateDate.Value.ToDateTime(TimeOnly.MinValue) - x.DueDate.ToDateTime(TimeOnly.MinValue)).Days

                                    })
                                    .GroupBy(x => x.InstanceId)
                                    .Select(g => new
                                    {
                                        InstanceId = g.Key,
                                        TimeLateCount = g.Count(x => x.TimeLate > 0),
                                        AverageLateDays = g.Where(x => x.TimeLate > 0).Any() ? g.Average(x => x.TimeLate) : 0
                                    }).ToList();

                var queryCategoryName = from i in _context.Instances
                                        join cs in _context.Classifications on i.ClassificationId equals cs.ClassificationId
                                        join c in _context.Categories on cs.CategoryId equals c.CategoryId
                                        where resultWithId.Select(x => x.InstanceId).Contains(i.InstanceId)
                                        select new
                                        {
                                            CategoryName = c.Name,
                                            InstanceId = i.InstanceId
                                        };
                var resultWithName = await queryCategoryName.ToListAsync();

                var result = (from r in resultWithId
                              join n in resultWithName on r.InstanceId equals n.InstanceId
                              group r by n.CategoryName into g
                              select new
                              {
                                  CategoryName = g.Key,
                                  TotalLate = g.Sum(x => x.TimeLateCount),
                                  AverageLateDays = g.Where(x => x.TimeLateCount > 0).Any() ? g.Average(x => x.AverageLateDays) : 0
                              }).ToList();

                return new JsonResult(result);
            }
            catch (Exception ex)
            {
                return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
            }
        }

        [HttpPost]
        public async Task<IActionResult> GetLifespan([FromBody] GetLifespanRequest request)
        {
            try
            {
                var query = from t in _context.ItemInstanceStatusTimelines
                            join i in _context.Instances on t.ItemInstanceId equals i.InstanceId
                            where t.StatusChange == (int)TimelineStatusChange.Add ||
                                    t.StatusChange == (int)TimelineStatusChange.EndOfLife ||
                                    t.StatusChange == (int)TimelineStatusChange.Missing
                            select new
                            {
                                ItemInstanceId = t.ItemInstanceId,
                                StatusChange = t.StatusChange,
                                Date = t.Date,
                                InstanceAcquisitonDate = i.AcquisitonDate
                            };

                if (request.StartDate.HasValue || request.EndDate.HasValue)
                    query = query.Where(r => (!request.StartDate.HasValue || r.InstanceAcquisitonDate >= request.StartDate) && (!request.EndDate.HasValue || r.InstanceAcquisitonDate <= request.EndDate));

                var dataList = await query.ToListAsync();

                var resultWithId = dataList.GroupBy(x => x.ItemInstanceId)
                                    .Select(g =>
                                    {
                                        var addDate = g.Single(x => x.StatusChange == (int)TimelineStatusChange.Add).Date;
                                        var endDate = g.SingleOrDefault(x =>
                                            x.StatusChange == (int)TimelineStatusChange.EndOfLife ||
                                            x.StatusChange == (int)TimelineStatusChange.Missing)?.Date;

                                        return new
                                        {
                                            InstanceId = g.Key,
                                            Lifespan = endDate.HasValue ? (endDate.Value.ToDateTime(TimeOnly.MinValue) - addDate.ToDateTime(TimeOnly.MinValue)).Days
                                                                        : (DateTime.Now - addDate.ToDateTime(TimeOnly.MinValue)).Days
                                        };
                                    }).ToList();

                var queryCategoryName = from i in _context.Instances
                                        join cs in _context.Classifications on i.ClassificationId equals cs.ClassificationId
                                        join c in _context.Categories on cs.CategoryId equals c.CategoryId
                                        where resultWithId.Select(x => x.InstanceId).Contains(i.InstanceId)
                                        select new
                                        {
                                            CategoryName = c.Name,
                                            InstanceId = i.InstanceId
                                        };
                var resultWithName = await queryCategoryName.ToListAsync();

                var result = (from r in resultWithId
                              join n in resultWithName on r.InstanceId equals n.InstanceId
                              group r by n.CategoryName into g
                              select new
                              {
                                  CategoryName = g.Key,
                                  AverageLifespan = g.Average(x => x.Lifespan)
                              }).ToList();

                return new JsonResult(result);
            }
            catch (Exception ex)
            {
                return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
            }
        }
    }
}