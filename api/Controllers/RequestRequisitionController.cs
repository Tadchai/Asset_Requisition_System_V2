using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Models;
using api.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers
{
    [ApiController]
    [Route("[controller]/[action]")]
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
                    var requisitionRequestModel = new RequisitionRequest
                    {
                        CategoryId = request.CategoryId,
                        Requirement = request.Requirement,
                        DueDate = request.DueDate,
                        ReasonRequest = request.ReasonRequest,
                        Status = RequestStatus.Pending.ToString(),
                        RequesterId = request.RequesterId
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

        [HttpGet]
        public async Task<IActionResult> GetRequest([FromQuery] int userId)
        {
            try
            {
                var responses = await (from r in _context.RequisitionRequests
                                       join c in _context.Categories on r.CategoryId equals c.CategoryId
                                       join i in _context.Instances on r.InstanceId equals i.InstanceId into instanceJoin
                                       from i in instanceJoin.DefaultIfEmpty()
                                       where r.RequesterId == userId
                                       select new GetRequestResponse
                                       {
                                           CategoryName = c.Name,
                                           Requirement = r.Requirement,
                                           DueDate = r.DueDate,
                                           ReasonRequest = r.ReasonRequest,
                                           Status = r.Status,
                                           AssetId = i.AssetId,
                                           ReasonRejected = r.ReasonRejected,
                                       }).ToListAsync();

                return new JsonResult(responses);
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
                    var requisitionRequestModel = await _context.RequisitionRequests.SingleAsync(r => r.RequestId == request.RequestId);
                    if (request.Status == RequestStatus.Allocated)
                    {
                        requisitionRequestModel.Status = RequestStatus.Allocated.ToString();
                        requisitionRequestModel.InstanceId = request.InstanceId;
                        requisitionRequestModel.ResponsibleId = request.ResponsibleId;

                        var instanceModel = await _context.Instances.SingleAsync(i => i.InstanceId == request.InstanceId);
                        instanceModel.RequestId = request.RequestId;
                    }
                    else
                    {
                        requisitionRequestModel.Status = RequestStatus.Rejected.ToString();
                        requisitionRequestModel.ReasonRejected = request.ReasonRejected;
                        requisitionRequestModel.ResponsibleId = request.ResponsibleId;
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

        [HttpGet]
        public async Task<IActionResult> GetRequestList()
        {
            try
            {
                var requestList = await (from r in _context.RequisitionRequests
                                         join u in _context.Users on r.RequesterId equals u.UserId
                                         join c in _context.Categories on r.CategoryId equals c.CategoryId
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
                                        .OrderBy(it => it.Status != RequestStatus.Pending.ToString())
                                        .ThenBy(it => it.DueDate)
                                        .ToListAsync();

                return new JsonResult(requestList);
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
                    requisitionRequestModel.Status = RequestStatus.Completed.ToString();

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

        [HttpGet]
        public async Task<IActionResult> GetConfirmList([FromQuery] int requesterId)
        {
            try
            {
                var itemList = await (from r in _context.RequisitionRequests
                                      join i in _context.Instances on r.InstanceId equals i.InstanceId
                                      join cs in _context.Classifications on i.ClassificationId equals cs.ClassificationId
                                      join c in _context.Categories on cs.CategoryId equals c.CategoryId
                                      where r.RequesterId == requesterId && r.Status == RequestStatus.Allocated.ToString()
                                      select new ConfirmListResponse
                                      {
                                          RequestId = r.RequestId,
                                          CategoryName = c.Name,
                                          ClassificationName = cs.Name,
                                          AssetId = i.AssetId
                                      }).ToListAsync();

                return new JsonResult(itemList);
            }
            catch (Exception ex)
            {
                return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAssetList([FromQuery] int requesterId)
        {
            try
            {
                var itemList = await (from r in _context.RequisitionRequests
                                      join i in _context.Instances on r.InstanceId equals i.InstanceId
                                      join cs in _context.Classifications on i.ClassificationId equals cs.ClassificationId
                                      join c in _context.Categories on cs.CategoryId equals c.CategoryId
                                      where r.RequesterId == requesterId && r.Status == RequestStatus.Completed.ToString()
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

        [HttpGet]
        public async Task<IActionResult> GetPendingRequest()
        {
            try
            {
                var requestList = await (from r in _context.RequisitionRequests
                                         join u in _context.Users on r.RequesterId equals u.UserId
                                         join c in _context.Categories on r.CategoryId equals c.CategoryId
                                         where r.Status == RequestStatus.Pending.ToString()
                                         select new GetRequestListResponse
                                         {
                                             Username = u.Username,
                                             CategoryName = c.Name,
                                             Requirement = r.Requirement,
                                             DueDate = r.DueDate,
                                             ReasonRequest = r.ReasonRequest,
                                             Status = r.Status,
                                             RequestId = r.RequestId
                                         }).ToListAsync();

                return new JsonResult(requestList);
            }
            catch (Exception ex)
            {
                return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAllocatedRequest()
        {
            try
            {
                var requestList = await (from r in _context.RequisitionRequests
                                         join u in _context.Users on r.RequesterId equals u.UserId
                                         join c in _context.Categories on r.CategoryId equals c.CategoryId
                                         where r.Status == RequestStatus.Allocated.ToString()
                                         select new GetRequestListResponse
                                         {
                                             Username = u.Username,
                                             CategoryName = c.Name,
                                             Requirement = r.Requirement,
                                             DueDate = r.DueDate,
                                             ReasonRequest = r.ReasonRequest,
                                             Status = r.Status,
                                             RequestId = r.RequestId
                                         }).ToListAsync();

                return new JsonResult(requestList);
            }
            catch (Exception ex)
            {
                return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
            }
        }


    }
}