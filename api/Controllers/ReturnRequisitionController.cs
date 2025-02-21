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
    public class ReturnRequisitionController : ControllerBase
    {
        private readonly EquipmentBorrowingV2Context _context;

        public ReturnRequisitionController(EquipmentBorrowingV2Context context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateReturn([FromBody] CreateReturnAssetRequest request)
        {
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    var requestId = await _context.Instances.Where(i => i.InstanceId == request.InstanceId)
                                        .Select(i => i.RequestId)
                                        .SingleAsync();

                    var checkRequisitionReturn = await _context.RequisitionReturns.AnyAsync(rt => rt.RequestId == requestId);
                    if (checkRequisitionReturn)
                        return new JsonResult(new MessageResponse { Message = "You have created ReturnAsset before", StatusCode = HttpStatusCode.BadRequest });

                    var requisitionReturnModel = new RequisitionReturn
                    {
                        ReasonReturn = request.ReasonReturn,
                        Status = (int)ReturnStatus.Pending,
                        RequestId = requestId.Value
                    };
                    await _context.RequisitionReturns.AddAsync(requisitionReturnModel);
                    await _context.SaveChangesAsync();

                    var historyModel = await _context.Histories.SingleAsync(h => h.RequestId == requestId);
                    historyModel.ReturnId = requisitionReturnModel.ReturnId;
                    historyModel.ReturnDate = DateOnly.FromDateTime(DateTime.Now);

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();
                    return new JsonResult(new MessageResponse { Message = "Create ReturnAsset successfully.", StatusCode = HttpStatusCode.Created });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
                }
            }
        }

        [HttpPost]
        public async Task<IActionResult> GetReturnList([FromBody] ReturnListRequest request)
        {
            try
            {
                var query = from rt in _context.RequisitionReturns
                            join rq in _context.RequisitionRequests on rt.RequestId equals rq.RequestId
                            join ur in _context.Users on rt.ResponsibleId equals ur.UserId into userJoin
                            from ur in userJoin.DefaultIfEmpty()
                            join z in from i in _context.Instances
                                      join cs in _context.Classifications on i.ClassificationId equals cs.ClassificationId
                                      join c in _context.Categories on cs.CategoryId equals c.CategoryId
                                      select new
                                      {
                                          i.InstanceId,
                                          CategoryId = c.CategoryId,
                                          CategoryName = c.Name,
                                          ClassificationName = cs.Name,
                                          i.AssetId
                                      } on rq.InstanceId equals z.InstanceId into zJoin
                            from z in zJoin.DefaultIfEmpty()
                            join u in _context.Users on rq.RequesterId equals u.UserId
                            orderby rt.ReturnId
                            select new GetReturnAssetListResponse
                            {
                                UserId = u.UserId,
                                FirstName = u.FirstName,
                                LastName = u.LastName,
                                CategoryId = z.CategoryId,
                                CategoryName = z.CategoryName,
                                ClassificationName = z.ClassificationName,
                                AssetId = z.AssetId,
                                ReasonReturn = rt.ReasonReturn,
                                Status = rt.Status,
                                ReturnId = rt.ReturnId,
                                ResponsibleId = ur.UserId,
                                FirstNameResponsible = ur.FirstName,
                                LastNameResponsible = ur.LastName,
                            };

                if (request.ReturnId.HasValue)
                    query = query.Where(r => r.ReturnId == request.ReturnId);

                if (request.UserId.HasValue)
                    query = query.Where(r => r.UserId == request.UserId);

                if (request.CategoryId.HasValue)
                    query = query.Where(r => r.CategoryId == request.CategoryId);

                if (request.ResponsibleId.HasValue)
                    query = query.Where(r => r.ResponsibleId == request.ResponsibleId);

                if (request.Status.HasValue)
                    query = query.Where(r => r.Status == request.Status.Value);

                int itemTotal = await query.CountAsync();
                int countBefore = 0, countAfter = 0;
                var queryWithFilter = query;
                if (request.NextCursor.HasValue)
                {
                    query = query.Where(r => r.ReturnId > request.NextCursor);
                }
                else if (request.PreviousCursor.HasValue)
                {
                    query = query.Where(r => r.ReturnId < request.PreviousCursor)
                                    .OrderByDescending(r => r.ReturnId);
                }

                List<GetReturnAssetListResponse> result;
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
                var firstId = result.First().ReturnId;
                var lastId = result.Last().ReturnId;
                countBefore = await queryWithFilter.Where(r => r.ReturnId < firstId).CountAsync();
                countAfter = await queryWithFilter.Where(r => r.ReturnId > lastId).CountAsync();
                int rowCount = result.Count;

                return new JsonResult(new PaginatedResponse<List<GetReturnAssetListResponse>>
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
        public async Task<IActionResult> ConfirmReturn([FromBody] ConfirmReturnAssetRequest request)
        {
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    var responsibleId = User.FindFirst("userId")?.Value;

                    var instanceModel = await _context.Instances.SingleAsync(i => i.InstanceId == request.InstanceId);
                    instanceModel.RequestId = null;

                    var requisitionReturnModel = await _context.RequisitionReturns.SingleAsync(rt => rt.ReturnId == request.ReturnId);
                    requisitionReturnModel.Status = (int)ReturnStatus.Completed;
                    requisitionReturnModel.ResponsibleId = int.Parse(responsibleId);

                    var historyModel = await _context.Histories.SingleAsync(h => h.ReturnId == request.ReturnId);
                    historyModel.ResponseReturnDate = DateOnly.FromDateTime(DateTime.Now);

                    var TimelineModel = new ItemInstanceStatusTimeline
                    {
                        ItemInstanceId = request.InstanceId,
                        StatusChange = (int)TimelineStatusChange.Return,
                        Date = DateOnly.FromDateTime(DateTime.Now)
                    };
                    await _context.ItemInstanceStatusTimelines.AddAsync(TimelineModel);

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();
                    return new JsonResult(new MessageResponse { Message = "Confirm ReturnAsset successfully.", StatusCode = HttpStatusCode.OK });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
                }
            }
        }

        [HttpPost]
        public async Task<IActionResult> GetPendingReturn([FromBody] PendingReturnRequest request)
        {
            try
            {
                var query = from rt in _context.RequisitionReturns
                            join rq in _context.RequisitionRequests on rt.RequestId equals rq.RequestId
                            join z in from i in _context.Instances
                                      join cs in _context.Classifications on i.ClassificationId equals cs.ClassificationId
                                      join c in _context.Categories on cs.CategoryId equals c.CategoryId
                                      select new
                                      {
                                          i.InstanceId,
                                          CategoryName = c.Name,
                                          ClassificationName = cs.Name,
                                          i.AssetId
                                      } on rq.InstanceId equals z.InstanceId into zJoin
                            from z in zJoin.DefaultIfEmpty()
                            join u in _context.Users on rq.RequesterId equals u.UserId
                            where rt.Status == (int)ReturnStatus.Pending
                            orderby rt.ReturnId
                            select new GetPendingReturnResponse
                            {
                                FirstName = u.FirstName,
                                LastName = u.LastName,
                                CategoryName = z.CategoryName,
                                ClassificationName = z.ClassificationName,
                                AssetId = z.AssetId,
                                ReasonReturn = rt.ReasonReturn,
                                InstanceId = z.InstanceId,
                                ReturnId = rt.ReturnId
                            };

                if (request.NextCursor.HasValue)
                {
                    query = query.Where(r => r.ReturnId > request.NextCursor);
                }

                var resultToCheck = await query.Take(request.PageSize + 1).ToListAsync();
                var result = resultToCheck.Take(request.PageSize).ToList();
                var lastResult = result.LastOrDefault();
                var NextCursor = lastResult?.ReturnId;

                bool hasNextPage = resultToCheck.Count() > request.PageSize;

                return new JsonResult(new PaginatedResponse<List<GetPendingReturnResponse>>
                {
                    HasNextPage = hasNextPage,
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