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
    public class RequisitionController : ControllerBase
    {
        private readonly EquipmentBorrowingV2Context _context;

        public RequisitionController(EquipmentBorrowingV2Context context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateRequisition([FromBody] CreateRequisitionRequest request)
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

        [HttpPost]
        public async Task<IActionResult> GetRequest([FromQuery] int userId)
        {
            try
            {
                var responses = await (from r in _context.RequisitionRequests
                                       join c in _context.Categories on r.CategoryId equals c.CategoryId
                                       join i in _context.Instances on r.InstaceId equals i.InstanceId into instanceJoin
                                       from i in instanceJoin.DefaultIfEmpty()
                                       where r.RequesterId == userId
                                       select new GetReasonRequestResponse
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
                        requisitionRequestModel.InstaceId = request.InstanceId;
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
                    return new JsonResult(new MessageResponse { Message = "Set successfully.", StatusCode = HttpStatusCode.Created });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
                }
            }
        }


    }
}