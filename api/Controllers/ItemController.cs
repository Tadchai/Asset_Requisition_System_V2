using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Models;
using api.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
                var categoryModel = await (from c in _context.Categories
                                           select new CategoryResponse
                                           {
                                               CategoryId = c.CategoryId,
                                               CategoryName = c.Name,
                                               Description = c.Description
                                           })
                                            .ToListAsync();

                return new JsonResult(categoryModel);
            }
            catch (Exception ex)
            {
                return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
            }
        }

        [HttpPost]
        public async Task<IActionResult> GetCategory([FromBody]GetCategoryRequest request)
        {
            try
            {
                var query = from c in _context.Categories
                            orderby c.CategoryId
                            select new CategoryResponse
                            {
                                CategoryId = c.CategoryId,
                                CategoryName = c.Name,
                                Description = c.Description
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
                var categoryModel = await (from c in _context.Categories
                                           where c.CategoryId == categoryId
                                           select new CategoryResponse
                                           {
                                               CategoryName = c.Name,
                                               Description = c.Description
                                           }).SingleAsync();

                return new JsonResult(categoryModel);
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
                var classificationList = await (from cs in _context.Classifications
                                                join c in _context.Categories on cs.CategoryId equals c.CategoryId
                                                select new ClassificationResponse
                                                {
                                                    ClassificationId = cs.ClassificationId,
                                                    CategoryName = c.Name,
                                                    ClassificationName = cs.Name,
                                                    Description = cs.Description
                                                }).ToListAsync();

                return new JsonResult(classificationList);
            }
            catch (Exception ex)
            {
                return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
            }
        }

        [HttpPost]
        public async Task<IActionResult> GetClassification([FromBody]GetClassificationRequest request)
        {
            try
            {
                var query = from cs in _context.Classifications
                            join c in _context.Categories on cs.CategoryId equals c.CategoryId
                            orderby cs.ClassificationId
                            select new ClassificationResponse
                            {
                                ClassificationId = cs.ClassificationId,
                                CategoryName = c.Name,
                                ClassificationName = cs.Name,
                                Description = cs.Description
                            };

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
                var classificationList = await (from cs in _context.Classifications
                                                join c in _context.Categories on cs.CategoryId equals c.CategoryId
                                                where cs.ClassificationId == classificationId
                                                select new ClassificationResponse
                                                {
                                                    CategoryName = c.Name,
                                                    ClassificationName = cs.Name,
                                                    Description = cs.Description
                                                }).SingleAsync();

                return new JsonResult(classificationList);
            }
            catch (Exception ex)
            {
                return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
            }
        }

        [HttpPost]
        public async Task<IActionResult> GetInstance([FromBody]GetInstancRequest request)
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
                var instanceList = await (from i in _context.Instances
                                          join cs in _context.Classifications on i.ClassificationId equals cs.ClassificationId
                                          join c in _context.Categories on cs.CategoryId equals c.CategoryId
                                          where i.InstanceId == instanceId
                                          select new InstanceResponse
                                          {
                                              CategoryName = c.Name,
                                              ClassificationName = cs.Name,
                                              AssetId = i.AssetId
                                          }).SingleAsync();

                return new JsonResult(instanceList);
            }
            catch (Exception ex)
            {
                return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
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
                        Description = request.Description
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
                        ClassificationId = request.ClassificationId
                    };
                    await _context.Instances.AddAsync(instanceModel);
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
                    instanceModel.AssetId = request.AssetId;

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
        public async Task<IActionResult> GetAssetId([FromBody]GetAssetIdRequest request)
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
                                          u.LastName,
                                      } on i.RequestId equals x.RequestId into xJoin
                            from x in xJoin.DefaultIfEmpty()
                            orderby i.InstanceId
                            select new GetAssetIdResponse
                            {
                                CategoryName = c.Name,
                                ClassificationName = cs.Name,
                                AssetId = i.AssetId,
                                FirstName = x.FirstName,
                                LastName = x.LastName,
                                Status = i.Status,
                                InstanceId = i.InstanceId
                            };

                if (!string.IsNullOrWhiteSpace(request.FirstName))
                    query = query.Where(r => r.FirstName.ToLower().Contains(request.FirstName.ToLower()));

                if (!string.IsNullOrWhiteSpace(request.LastName))
                    query = query.Where(r => r.LastName.ToLower().Contains(request.LastName.ToLower()));

                if (!string.IsNullOrWhiteSpace(request.CategoryName))
                    query = query.Where(r => r.CategoryName.ToLower().Contains(request.CategoryName.ToLower()));

                if (request.Status.HasValue)
                    query = query.Where(r => r.Status == request.Status.Value);

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
                var AssetIdList = await (from c in _context.Categories
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
                                         select new GetAssetIdResponse
                                         {
                                             CategoryName = c.Name,
                                             CategoryDescription = c.Description,
                                             ClassificationName = cs.Name,
                                             ClassificationDescription = cs.Description,
                                             AssetId = i.AssetId,
                                             FirstName = x.FirstName,
                                             LastName = x.LastName,
                                             Status = i.Status,
                                             InstanceId = i.InstanceId
                                         }).SingleAsync();

                return new JsonResult(AssetIdList);
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
                    }
                    else if (request.Status == InstanceStatus.Missing)
                    {
                        instanceModel.Status = (int)InstanceStatus.Missing;
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
                var instanceList = await (from i in _context.Instances
                                          join cs in _context.Classifications on i.ClassificationId equals cs.ClassificationId
                                          join c in _context.Categories on cs.CategoryId equals c.CategoryId
                                          where i.RequestId == null && i.Status == (int)InstanceStatus.Available
                                          select new InstanceResponse
                                          {
                                              InstanceId = i.InstanceId,
                                              CategoryName = c.Name,
                                              ClassificationName = cs.Name,
                                              AssetId = i.AssetId
                                          }).ToListAsync();

                return new JsonResult(instanceList);
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
                var response = await (from i in _context.Instances
                                          join cs in _context.Classifications on i.ClassificationId equals cs.ClassificationId
                                          join c in _context.Categories on cs.CategoryId equals c.CategoryId
                                          where i.Status == (int)InstanceStatus.Available
                                          group i by new { c.Name } into grouped
                                          select new CountInstanceResponse
                                          {
                                              CategoryName = grouped.Key.Name,
                                              TotalInstances = grouped.Count(),
                                              TotalUsed = grouped.Count(i => i.RequestId != null)
                                          }).ToListAsync();

                return new JsonResult(response);
            }
            catch (Exception ex)
            {
                return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
            }
        }
    }
}