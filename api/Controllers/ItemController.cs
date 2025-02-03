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
        public async Task<IActionResult> GetCategory(PaginatedRequest request)
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

                int skipPage = (request.Page - 1) * request.PageSize;
                int RowCount = await query.CountAsync();
                var result = await query.Skip(skipPage).Take(request.PageSize).ToListAsync();

                return new JsonResult(new
                {
                    currentPage = request.Page,
                    request.PageSize,
                    RowCount,
                    data = result
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
        public async Task<IActionResult> GetClassification(PaginatedRequest request)
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

                int skipPage = (request.Page - 1) * request.PageSize;
                int RowCount = await query.CountAsync();
                var result = await query.Skip(skipPage).Take(request.PageSize).ToListAsync();

                return new JsonResult(new
                {
                    currentPage = request.Page,
                    request.PageSize,
                    RowCount,
                    data = result
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
        public async Task<IActionResult> GetInstance(PaginatedRequest request)
        {
            try
            {
                var query = from i in _context.Instances
                            join cs in _context.Classifications on i.ClassificationId equals cs.ClassificationId
                            join c in _context.Categories on cs.CategoryId equals c.CategoryId
                            select new InstanceResponse
                            {
                                InstanceId = i.InstanceId,
                                CategoryName = c.Name,
                                ClassificationName = cs.Name,
                                AssetId = i.AssetId
                            };

                int skipPage = (request.Page - 1) * request.PageSize;
                int RowCount = await query.CountAsync();
                var result = await query.Skip(skipPage).Take(request.PageSize).ToListAsync();

                return new JsonResult(new
                {
                    currentPage = request.Page,
                    request.PageSize,
                    RowCount,
                    data = result
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
        public async Task<IActionResult> GetAssetId(PaginatedRequest request)
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
                                          u.Username
                                      } on i.RequestId equals x.RequestId into xJoin
                            from x in xJoin.DefaultIfEmpty()
                            orderby i.Status != (int)InstanceStatus.Available
                            select new GetAssetIdResponse
                            {
                                CategoryName = c.Name,
                                ClassificationName = cs.Name,
                                AssetId = i.AssetId,
                                Username = x.Username,
                                Status = i.Status,
                                InstanceId = i.InstanceId
                            };


                int skipPage = (request.Page - 1) * request.PageSize;
                int RowCount = await query.CountAsync();
                var result = await query.Skip(skipPage).Take(request.PageSize).ToListAsync();

                return new JsonResult(new
                {
                    currentPage = request.Page,
                    request.PageSize,
                    RowCount,
                    data = result
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
                                                       u.Username
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
                                             Username = x.Username,
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
    }
}