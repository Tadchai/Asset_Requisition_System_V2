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
        public async Task<IActionResult> GetRequest(PaginatedRequest request)
        {
            try
            {
                var userId = User.FindFirst("userId")?.Value;

                var query = from r in _context.RequisitionRequests
                            join c in _context.Categories on r.CategoryId equals c.CategoryId
                            join i in _context.Instances on r.InstanceId equals i.InstanceId into instanceJoin
                            from i in instanceJoin.DefaultIfEmpty()
                            where r.RequesterId == int.Parse(userId)
                            orderby r.Status != (int)RequestStatus.Pending, r.RequestId
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

        [HttpPost]
        public async Task<IActionResult> SetRequest([FromBody] SetRequest request)
        {
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    var responsibleId = User.FindFirst("userId")?.Value;

                    var requisitionRequestModel = await _context.RequisitionRequests.SingleAsync(r => r.RequestId == request.RequestId);
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
        public async Task<IActionResult> GetRequestList(PaginatedRequest request)
        {
            try
            {
                var query = from r in _context.RequisitionRequests
                            join u in _context.Users on r.RequesterId equals u.UserId
                            join c in _context.Categories on r.CategoryId equals c.CategoryId
                            orderby r.Status != (int)RequestStatus.Pending ,r.DueDate
                            select new GetRequestListResponse
                            {
                                Username = u.Username,
                                CategoryName = c.Name,
                                Requirement = r.Requirement,
                                DueDate = r.DueDate,
                                ReasonRequest = r.ReasonRequest,
                                Status = r.Status,
                                RequestId = r.RequestId
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
                                             Username = u.Username,
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
        public async Task<IActionResult> GetConfirmList(PaginatedRequest request)
        {
            try
            {
                var userId = User.FindFirst("userId")?.Value;

                var query = from r in _context.RequisitionRequests
                            join i in _context.Instances on r.InstanceId equals i.InstanceId
                            join cs in _context.Classifications on i.ClassificationId equals cs.ClassificationId
                            join c in _context.Categories on cs.CategoryId equals c.CategoryId
                            where r.RequesterId == int.Parse(userId) && r.Status == (int)RequestStatus.Allocated
                            select new ConfirmListResponse
                            {
                                RequestId = r.RequestId,
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
        public async Task<IActionResult> GetUserAsset()
        {
            try
            {
                var userId = User.FindFirst("userId")?.Value;

                var itemList = await (from r in _context.RequisitionRequests
                                      join i in _context.Instances on r.InstanceId equals i.InstanceId
                                      join cs in _context.Classifications on i.ClassificationId equals cs.ClassificationId
                                      join c in _context.Categories on cs.CategoryId equals c.CategoryId
                                      join rt in _context.RequisitionReturns on r.RequestId equals rt.RequestId into ReturnJoin
                                      from rt in ReturnJoin.DefaultIfEmpty()
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
        public async Task<IActionResult> GetUserAsset(PaginatedRequest request)
        {
            try
            {
                var userId = User.FindFirst("userId")?.Value;

                var query = from r in _context.RequisitionRequests
                            join i in _context.Instances on r.InstanceId equals i.InstanceId
                            join cs in _context.Classifications on i.ClassificationId equals cs.ClassificationId
                            join c in _context.Categories on cs.CategoryId equals c.CategoryId
                            join rt in _context.RequisitionReturns on r.RequestId equals rt.RequestId into ReturnJoin
                            from rt in ReturnJoin.DefaultIfEmpty()
                            where r.RequesterId == int.Parse(userId) && i.RequestId == r.RequestId && r.Status == (int)RequestStatus.Completed
                            select new AssetListResponse
                            {
                                RequestId = r.RequestId,
                                CategoryName = c.Name,
                                ClassificationName = cs.Name,
                                AssetId = i.AssetId,
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

        [HttpPost]
        public async Task<IActionResult> GetPendingRequest(PaginatedRequest request)
        {
            try
            {
                var query = from r in _context.RequisitionRequests
                            join u in _context.Users on r.RequesterId equals u.UserId
                            join c in _context.Categories on r.CategoryId equals c.CategoryId
                            where r.Status == (int)RequestStatus.Pending
                            orderby r.DueDate
                            select new GetRequestListResponse
                            {
                                Username = u.Username,
                                CategoryName = c.Name,
                                Requirement = r.Requirement,
                                DueDate = r.DueDate,
                                ReasonRequest = r.ReasonRequest,
                                Status = r.Status,
                                RequestId = r.RequestId
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

        [HttpPost]
        public async Task<IActionResult> GetAllocatedRequest(PaginatedRequest request)
        {
            try
            {
                var query = from r in _context.RequisitionRequests
                            join u in _context.Users on r.RequesterId equals u.UserId
                            join c in _context.Categories on r.CategoryId equals c.CategoryId
                            where r.Status == (int)RequestStatus.Allocated
                            select new GetRequestListResponse
                            {
                                Username = u.Username,
                                CategoryName = c.Name,
                                Requirement = r.Requirement,
                                DueDate = r.DueDate,
                                ReasonRequest = r.ReasonRequest,
                                Status = r.Status,
                                RequestId = r.RequestId
                            };

                int skipPage = (request.Page - 1) * request.PageSize;
                int RowCount = await query.CountAsync();
                var result = await query.Skip(skipPage).Take(request.PageSize)
                                         .ToListAsync();

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


    }
}