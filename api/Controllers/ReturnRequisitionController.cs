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
        public async Task<IActionResult> GetReturnList([FromBody]ReturnListRequest request)
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
                                          CategoryName = c.Name,
                                          ClassificationName = cs.Name,
                                          i.AssetId
                                      } on rq.InstanceId equals z.InstanceId into zJoin
                            from z in zJoin.DefaultIfEmpty()
                            join u in _context.Users on rq.RequesterId equals u.UserId
                            orderby rt.ReturnId
                            select new GetReturnAssetListResponse
                            {
                                FirstName = u.FirstName,
                                LastName = u.LastName,
                                CategoryName = z.CategoryName,
                                ClassificationName = z.ClassificationName,
                                AssetId = z.AssetId,
                                ReasonReturn = rt.ReasonReturn,
                                Status = rt.Status,
                                InstanceId = z.InstanceId,
                                ReturnId = rt.ReturnId,
                                FirstNameResponsible = ur.FirstName,
                                LastNameResponsible = ur.LastName,
                            };
                
                if (!string.IsNullOrWhiteSpace(request.FirstName))
                    query = query.Where(r => r.FirstName.ToLower().Contains(request.FirstName.ToLower()));

                if (!string.IsNullOrWhiteSpace(request.LastName))
                    query = query.Where(r => r.LastName.ToLower().Contains(request.LastName.ToLower()));

                if (!string.IsNullOrWhiteSpace(request.CategoryName))
                    query = query.Where(r => r.CategoryName.ToLower().Contains(request.CategoryName.ToLower()));

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
        public async Task<IActionResult> GetPendingReturn([FromBody]PendingReturnRequest request)
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
                            select new GetReturnAssetListResponse
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
               
                var result = await query.Take(request.PageSize).ToListAsync();
                var lastResult = result.LastOrDefault();
                var NextCursor = lastResult?.ReturnId;

                bool hasNextPage = await query.Skip(request.PageSize).AnyAsync();

                return new JsonResult(new PaginatedResponse<List<GetReturnAssetListResponse>>
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