using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
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
    public class RequestRequisitionController : ControllerBase
    {
        private readonly EquipmentBorrowingV2Context _context;

        public RequestRequisitionController(EquipmentBorrowingV2Context context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateRequest([FromBody] CreateRequisitionRequest request)
        {
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    var userId = User.FindFirst("userId")?.Value;

                    var requisitionRequestModel = new RequisitionRequest
                    {
                        CategoryId = request.CategoryId,
                        Requirement = request.Requirement,
                        DueDate = request.DueDate,
                        ReasonRequest = request.ReasonRequest,
                        Status = (int)RequestStatus.Pending,
                        RequesterId = int.Parse(userId)
                    };
                    await _context.RequisitionRequests.AddAsync(requisitionRequestModel);
                    await _context.SaveChangesAsync();

                    await transaction.CommitAsync();
                    return new JsonResult(new MessageResponse { Message = "RequisitionRequest Created successfully.", StatusCode = HttpStatusCode.Created });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
                }
            }
        }

        [HttpPost]
        public async Task<IActionResult> GetRequest([FromBody] GetRequestRequest request)
        {
            try
            {
                var userId = User.FindFirst("userId")?.Value;

                var query = from r in _context.RequisitionRequests
                            join c in _context.Categories on r.CategoryId equals c.CategoryId
                            join i in _context.Instances on r.InstanceId equals i.InstanceId into instanceJoin
                            from i in instanceJoin.DefaultIfEmpty()
                            where r.RequesterId == int.Parse(userId)
                            orderby r.RequestId
                            select new GetRequestResponse
                            {
                                RequestId = r.RequestId,
                                CategoryName = c.Name,
                                Requirement = r.Requirement,
                                DueDate = r.DueDate,
                                ReasonRequest = r.ReasonRequest,
                                Status = r.Status,
                                AssetId = i.AssetId,
                                ReasonRejected = r.ReasonRejected,
                            };

                if (!string.IsNullOrWhiteSpace(request.CategoryName))
                    query = query.Where(r => r.CategoryName.ToLower().Contains(request.CategoryName.ToLower()));

                if (request.DueDate.HasValue)
                    query = query.Where(r => r.DueDate == request.DueDate.Value);

                if (request.Status.HasValue)
                    query = query.Where(r => r.Status == request.Status.Value);

                int itemTotal = await query.CountAsync();
                int countBefore = 0, countAfter = 0;
                var queryWithFilter = query;
                if (request.NextCursor.HasValue)
                {
                    query = query.Where(r => r.RequestId > request.NextCursor);
                }
                else if (request.PreviousCursor.HasValue)
                {
                    query = query.Where(r => r.RequestId < request.PreviousCursor)
                                    .OrderByDescending(r => r.RequestId);
                }

                List<GetRequestResponse> result;
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
                var firstId = result.First().RequestId;
                var lastId = result.Last().RequestId;
                countBefore = await queryWithFilter.Where(r => r.RequestId < firstId).CountAsync();
                countAfter = await queryWithFilter.Where(r => r.RequestId > lastId).CountAsync();
                int rowCount = result.Count;

                return new JsonResult(new PaginatedResponse<List<GetRequestResponse>>
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

        [HttpPost]
        public async Task<IActionResult> SetRequest([FromBody] SetRequest request)
        {
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    var responsibleId = User.FindFirst("userId")?.Value;

                    var requisitionRequestModel = await _context.RequisitionRequests.SingleAsync(r => r.RequestId == request.RequestId);
                    if (requisitionRequestModel.RequesterId == int.Parse(responsibleId))
                        return new JsonResult(new MessageResponse { Message = "cannot set request to yourself", StatusCode = HttpStatusCode.BadRequest });

                    if (request.Status == RequestStatus.Allocated)
                    {
                        requisitionRequestModel.Status = (int)RequestStatus.Allocated;
                        requisitionRequestModel.InstanceId = request.InstanceId;
                        requisitionRequestModel.ResponsibleId = int.Parse(responsibleId);

                        var instanceModel = await _context.Instances.SingleAsync(i => i.InstanceId == request.InstanceId);
                        instanceModel.RequestId = request.RequestId;
                    }
                    else
                    {
                        requisitionRequestModel.Status = (int)RequestStatus.Rejected;
                        requisitionRequestModel.ReasonRejected = request.ReasonRejected;
                        requisitionRequestModel.ResponsibleId = int.Parse(responsibleId);
                    }

                    await _context.SaveChangesAsync();

                    await transaction.CommitAsync();
                    return new JsonResult(new MessageResponse { Message = "Set successfully.", StatusCode = HttpStatusCode.OK });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
                }
            }
        }

        [HttpPost]
        public async Task<IActionResult> GetRequestList([FromBody] RequestListRequest request)
        {
            try
            {
                var query = from r in _context.RequisitionRequests
                            join ur in _context.Users on r.ResponsibleId equals ur.UserId into userJoin
                            from ur in userJoin.DefaultIfEmpty()
                            join u in _context.Users on r.RequesterId equals u.UserId
                            join c in _context.Categories on r.CategoryId equals c.CategoryId
                            orderby r.RequestId
                            select new GetRequestListResponse
                            {
                                FirstName = u.FirstName,
                                LastName = u.LastName,
                                CategoryName = c.Name,
                                Requirement = r.Requirement,
                                DueDate = r.DueDate,
                                ReasonRequest = r.ReasonRequest,
                                Status = r.Status,
                                RequestId = r.RequestId,
                                FirstNameResponsible = ur.FirstName,
                                LastNameResponsible = ur.LastName,
                            };

                if (!string.IsNullOrWhiteSpace(request.FirstName))
                    query = query.Where(r => r.FirstName.ToLower().Contains(request.FirstName.ToLower()));

                if (!string.IsNullOrWhiteSpace(request.LastName))
                    query = query.Where(r => r.LastName.ToLower().Contains(request.LastName.ToLower()));

                if (!string.IsNullOrWhiteSpace(request.CategoryName))
                    query = query.Where(r => r.CategoryName.ToLower().Contains(request.CategoryName.ToLower()));

                if (request.DueDate.HasValue)
                    query = query.Where(r => r.DueDate == request.DueDate.Value);

                if (request.Status.HasValue)
                    query = query.Where(r => r.Status == request.Status.Value);

                if (!string.IsNullOrWhiteSpace(request.FirstNameResponsible))
                    query = query.Where(r => r.FirstNameResponsible.ToLower().Contains(request.FirstNameResponsible.ToLower()));

                if (!string.IsNullOrWhiteSpace(request.LastNameResponsible))
                    query = query.Where(r => r.LastNameResponsible.ToLower().Contains(request.LastNameResponsible.ToLower()));

                int itemTotal = await query.CountAsync();
                int countBefore = 0, countAfter = 0;
                var queryWithFilter = query;
                if (request.NextCursor.HasValue)
                {
                    query = query.Where(r => r.RequestId > request.NextCursor);
                }
                else if (request.PreviousCursor.HasValue)
                {
                    query = query.Where(r => r.RequestId < request.PreviousCursor)
                                    .OrderByDescending(r => r.RequestId);
                }

                List<GetRequestListResponse> result;
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
                var firstId = result.First().RequestId;
                var lastId = result.Last().RequestId;
                countBefore = await queryWithFilter.Where(r => r.RequestId < firstId).CountAsync();
                countAfter = await queryWithFilter.Where(r => r.RequestId > lastId).CountAsync();
                int rowCount = result.Count;

                return new JsonResult(new PaginatedResponse<List<GetRequestListResponse>>
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
        public async Task<IActionResult> GetRequestListById(int requestId)
        {
            try
            {
                var requestList = await (from r in _context.RequisitionRequests
                                         join u in _context.Users on r.RequesterId equals u.UserId
                                         join c in _context.Categories on r.CategoryId equals c.CategoryId
                                         where r.RequestId == requestId
                                         select new GetRequestListResponse
                                         {
                                             FirstName = u.FirstName,
                                             LastName = u.LastName,
                                             CategoryName = c.Name,
                                             Requirement = r.Requirement,
                                             DueDate = r.DueDate,
                                             ReasonRequest = r.ReasonRequest,
                                             Status = r.Status,
                                             RequestId = r.RequestId
                                         })
                                        .SingleAsync();

                return new JsonResult(requestList);
            }
            catch (Exception ex)
            {
                return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
            }
        }

        [HttpPost]
        public async Task<IActionResult> ConfirmRequest([FromBody] ConfirmRequest request)
        {
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    var requisitionRequestModel = await _context.RequisitionRequests.SingleAsync(r => r.RequestId == request.RequestId);
                    requisitionRequestModel.Status = (int)RequestStatus.Completed;

                    await _context.SaveChangesAsync();

                    await transaction.CommitAsync();
                    return new JsonResult(new MessageResponse { Message = "Confirm Request successfully.", StatusCode = HttpStatusCode.OK });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
                }
            }
        }

        [HttpPost]
        public async Task<IActionResult> GetConfirmList([FromBody] GetConfirmListRequest request)
        {
            try
            {
                var userId = User.FindFirst("userId")?.Value;

                var query = from r in _context.RequisitionRequests
                            join i in _context.Instances on r.InstanceId equals i.InstanceId
                            join cs in _context.Classifications on i.ClassificationId equals cs.ClassificationId
                            join c in _context.Categories on cs.CategoryId equals c.CategoryId
                            where r.RequesterId == int.Parse(userId) && r.Status == (int)RequestStatus.Allocated
                            orderby r.RequestId
                            select new ConfirmListResponse
                            {
                                RequestId = r.RequestId,
                                CategoryName = c.Name,
                                ClassificationName = cs.Name,
                                AssetId = i.AssetId
                            };

                int itemTotal = await query.CountAsync();
                int countBefore = 0, countAfter = 0;
                var queryWithFilter = query;
                if (request.NextCursor.HasValue)
                {
                    query = query.Where(r => r.RequestId > request.NextCursor);
                }
                else if (request.PreviousCursor.HasValue)
                {
                    query = query.Where(r => r.RequestId < request.PreviousCursor)
                                    .OrderByDescending(r => r.RequestId);
                }

                List<ConfirmListResponse> result;
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
                var firstId = result.First().RequestId;
                var lastId = result.Last().RequestId;
                countBefore = await queryWithFilter.Where(r => r.RequestId < firstId).CountAsync();
                countAfter = await queryWithFilter.Where(r => r.RequestId > lastId).CountAsync();
                int rowCount = result.Count;

                return new JsonResult(new PaginatedResponse<List<ConfirmListResponse>>
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
        public async Task<IActionResult> GetUserAsset()
        {
            try
            {
                var userId = User.FindFirst("userId")?.Value;

                var itemList = await (from r in _context.RequisitionRequests
                                      join i in _context.Instances on r.InstanceId equals i.InstanceId
                                      join cs in _context.Classifications on i.ClassificationId equals cs.ClassificationId
                                      join c in _context.Categories on cs.CategoryId equals c.CategoryId
                                      where r.RequesterId == int.Parse(userId) && i.RequestId == r.RequestId && r.Status == (int)RequestStatus.Completed
                                      select new AssetListResponse
                                      {
                                          RequestId = r.RequestId,
                                          CategoryName = c.Name,
                                          ClassificationName = cs.Name,
                                          AssetId = i.AssetId,
                                          InstanceId = i.InstanceId
                                      }).ToListAsync();

                return new JsonResult(itemList);
            }
            catch (Exception ex)
            {
                return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
            }
        }

        [HttpPost]
        public async Task<IActionResult> GetUserAsset([FromBody] GetUserAssetRequest request)
        {
            try
            {
                var userId = User.FindFirst("userId")?.Value;

                var query = from r in _context.RequisitionRequests
                            join i in _context.Instances on r.InstanceId equals i.InstanceId
                            join cs in _context.Classifications on i.ClassificationId equals cs.ClassificationId
                            join c in _context.Categories on cs.CategoryId equals c.CategoryId
                            where r.RequesterId == int.Parse(userId) && i.RequestId == r.RequestId && r.Status == (int)RequestStatus.Completed
                            orderby r.RequestId
                            select new AssetListResponse
                            {
                                RequestId = r.RequestId,
                                CategoryName = c.Name,
                                ClassificationName = cs.Name,
                                AssetId = i.AssetId,
                                InstanceId = i.InstanceId
                            };

                int itemTotal = await query.CountAsync();
                int countBefore = 0, countAfter = 0;
                var queryWithFilter = query;
                if (request.NextCursor.HasValue)
                {
                    query = query.Where(r => r.RequestId > request.NextCursor);
                }
                else if (request.PreviousCursor.HasValue)
                {
                    query = query.Where(r => r.RequestId < request.PreviousCursor)
                                    .OrderByDescending(r => r.RequestId);
                }

                List<AssetListResponse> result;
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
                var firstId = result.First().RequestId;
                var lastId = result.Last().RequestId;
                countBefore = await queryWithFilter.Where(r => r.RequestId < firstId).CountAsync();
                countAfter = await queryWithFilter.Where(r => r.RequestId > lastId).CountAsync();
                int rowCount = result.Count;

                return new JsonResult(new PaginatedResponse<List<AssetListResponse>>
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

        [HttpPost]
        public async Task<IActionResult> GetPendingRequest([FromBody] PendingRequestRequest request)
        {
            try
            {
                var query = from r in _context.RequisitionRequests
                            join u in _context.Users on r.RequesterId equals u.UserId
                            join c in _context.Categories on r.CategoryId equals c.CategoryId
                            where r.Status == (int)RequestStatus.Pending
                            orderby r.DueDate, r.RequestId
                            select new GetRequestListResponse
                            {
                                FirstName = u.FirstName,
                                LastName = u.LastName,
                                CategoryName = c.Name,
                                Requirement = r.Requirement,
                                DueDate = r.DueDate,
                                ReasonRequest = r.ReasonRequest,
                                Status = r.Status,
                                RequestId = r.RequestId
                            };

                if (request.DayNextCursor.HasValue && request.NextCursor.HasValue)
                {
                    query = query.Where(r => r.DueDate > request.DayNextCursor ||
                                         (r.DueDate == request.DayNextCursor && r.RequestId > request.NextCursor));
                }
               
                var result = await query.Take(request.PageSize).ToListAsync();
                var lastResult = result.LastOrDefault();
                var NextCursor = lastResult?.RequestId;
                var DayNextCursor = lastResult?.DueDate;

                bool hasNextPage = await query.Skip(request.PageSize).AnyAsync();

                return new JsonResult(new PaginatedResponse<List<GetRequestListResponse>>
                {
                    HasNextPage = hasNextPage,
                    DayNextCursor = DayNextCursor,
                    NextCursor = NextCursor,
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
            }
        }

        [HttpPost]
        public async Task<IActionResult> GetAllocatedRequest([FromBody] AllocatedRequestRequest request)
        {
            try
            {
                var query = from r in _context.RequisitionRequests
                            join u in _context.Users on r.RequesterId equals u.UserId
                            join c in _context.Categories on r.CategoryId equals c.CategoryId
                            where r.Status == (int)RequestStatus.Allocated
                            orderby r.DueDate, r.RequestId
                            select new GetRequestListResponse
                            {
                                FirstName = u.FirstName,
                                LastName = u.LastName,
                                CategoryName = c.Name,
                                Requirement = r.Requirement,
                                DueDate = r.DueDate,
                                ReasonRequest = r.ReasonRequest,
                                Status = r.Status,
                                RequestId = r.RequestId
                            };

                if (request.DayNextCursor.HasValue && request.NextCursor.HasValue)
                {
                    query = query.Where(r => r.DueDate > request.DayNextCursor ||
                                         (r.DueDate == request.DayNextCursor && r.RequestId > request.NextCursor));
                }
                var result = await query.Take(request.PageSize).ToListAsync();
                var lastResult = result.LastOrDefault();
                var NextCursor = lastResult?.RequestId;
                var DayNextCursor = lastResult?.DueDate;

                return new JsonResult(new PaginatedResponse<List<GetRequestListResponse>>
                {
                    DayNextCursor = DayNextCursor,
                    NextCursor = NextCursor,
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
            }
        }


    }
}