using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using api.Models;
using api.ViewModels;
using IdentityModel.Client;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;


namespace api.Controllers
{
    [ApiController]
    [Route("[controller]/[action]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly EquipmentBorrowingV2Context _context;

        public UserController(EquipmentBorrowingV2Context context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> UpsertUser()
        {
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    var subjectFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                    var firstNameFromToken = User.FindFirst(ClaimTypes.GivenName)?.Value;
                    var lastNameFromToken = User.FindFirst(ClaimTypes.Surname)?.Value;
                    var roleFromToken = User.FindFirst("realm_access")?.Value;

                    var userModal = await _context.Users.SingleOrDefaultAsync(u => u.SubjectId == subjectFromToken);
                    if (userModal == null)
                    {
                        var newUserModal = new User
                        {
                            FirstName = firstNameFromToken,
                            LastName = lastNameFromToken,
                            SubjectId = subjectFromToken,
                            Role = roleFromToken.Contains("procurement") ? true : false
                        };

                        await _context.Users.AddAsync(newUserModal);

                        await _context.SaveChangesAsync();
                        await transaction.CommitAsync();
                        return new JsonResult(new MessageResponse { Message = "User created successfully.", StatusCode = HttpStatusCode.Created });
                    }
                    else
                    {
                        userModal.FirstName = firstNameFromToken;
                        userModal.LastName = lastNameFromToken;
                        userModal.Role = roleFromToken.Contains("procurement") ? true : false;

                        await _context.SaveChangesAsync();
                        await transaction.CommitAsync();
                        return new JsonResult(new MessageResponse { Message = "User update successfully.", StatusCode = HttpStatusCode.OK });
                    }
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
                }

            }
        }

        [HttpGet]
        public async Task<IActionResult> GetUserName()
        {
            try
            {
                var userId = User.FindFirst("userId")?.Value;

                var result = await (from u in _context.Users
                                    where u.UserId == int.Parse(userId)
                                    select new GetUserNameResponse
                                    {
                                        FirstName = u.FirstName,
                                        LastName = u.LastName,
                                    }).SingleAsync();

                return new JsonResult(result);
            }
            catch (Exception ex)
            {
                return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
            }
        }


        [HttpGet]
        public async Task<IActionResult> GetUser()
        {
            try
            {
                var result = await (from u in _context.Users
                                    select new GetUserResponse
                                    {
                                        UserId = u.UserId,
                                        FirstName = u.FirstName,
                                        LastName = u.LastName,
                                    }).ToListAsync();

                return new JsonResult(result);
            }
            catch (Exception ex)
            {
                return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetProcurer()
        {
            try
            {
                var result = await (from u in _context.Users
                                    where u.Role == true
                                    select new GetUserResponse
                                    {
                                        UserId = u.UserId,
                                        FirstName = u.FirstName,
                                        LastName = u.LastName,
                                    }).ToListAsync();

                return new JsonResult(result);
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

                var query = from r in _context.RequisitionRequests
                            join i in _context.Instances on r.InstanceId equals i.InstanceId
                            join cs in _context.Classifications on i.ClassificationId equals cs.ClassificationId
                            join c in _context.Categories on cs.CategoryId equals c.CategoryId
                            where r.RequesterId == int.Parse(userId)
                                && i.RequestId == r.RequestId
                                && r.Status == (int)RequestStatus.Completed
                            select new AssetListResponse
                            {
                                RequestId = r.RequestId,
                                CategoryName = c.Name,
                                ClassificationName = cs.Name,
                                AssetId = i.AssetId,
                                InstanceId = i.InstanceId,
                                HasReturn = _context.RequisitionReturns.Any(rt => rt.RequestId == r.RequestId)
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
        public async Task<IActionResult> GetUserRequestCount([FromBody] UserRequestCountRequest request)
        {
            try
            {
                var query = from u in _context.Users
                            join r in _context.RequisitionRequests on u.UserId equals r.RequesterId into requestJoin
                            from r in requestJoin.DefaultIfEmpty()
                            select new
                            {
                                UserId = u.UserId,
                                Status = (int?)r.Status,
                                RequestDate = (DateOnly?)r.RequestDate
                            };

                if (request.UserId.HasValue)
                    query = query.Where(r => r.UserId == request.UserId);

                if (request.StartDate.HasValue || request.EndDate.HasValue)
                    query = query.Where(r => (!request.StartDate.HasValue || r.RequestDate >= request.StartDate) && (!request.EndDate.HasValue || r.RequestDate <= request.EndDate));

                var dataList = await query.ToListAsync();

                var resultWithId = (from d in dataList
                                    group d by d.UserId into g
                                    select new
                                    {
                                        UserId = g.Key,
                                        TotalPending = g.Count(x => x.Status == (int)RequestStatus.Pending),
                                        TotalAllocated = g.Count(x => x.Status == (int)RequestStatus.Allocated),
                                        TotalCompleted = g.Count(x => x.Status == (int)RequestStatus.Completed),
                                        TotalReject = g.Count(x => x.Status == (int)RequestStatus.Rejected),
                                        TotalRequest = g.Count(x => x.Status != null)
                                    }).ToList();

                var queryCategoryName = from u in _context.Users
                                        where resultWithId.Select(x => x.UserId).Contains(u.UserId)
                                        select new
                                        {
                                            FirstName = u.FirstName,
                                            LastName = u.LastName,
                                            UserId = u.UserId
                                        };
                var resultWithName = await queryCategoryName.ToListAsync();

                var result = (from r in resultWithId
                              join n in resultWithName on r.UserId equals n.UserId
                              select new
                              {
                                  FirstName = n.FirstName,
                                  LastName = n.LastName,
                                  TotalPending = r.TotalPending,
                                  TotalAllocated = r.TotalAllocated,
                                  TotalCompleted = r.TotalCompleted,
                                  TotalReject = r.TotalReject,
                                  TotalRequest = r.TotalRequest,
                              }).ToList();

                return new JsonResult(result);
            }
            catch (Exception ex)
            {
                return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
            }
        }

        [HttpPost]
        public async Task<IActionResult> GetResponsibleRequestCount([FromBody] ResponsibleRequestCountRequest request)
        {
            try
            {
                var queryRequest = from u in _context.Users
                                   join r in _context.RequisitionRequests on u.UserId equals r.ResponsibleId into requestJoin
                                   from r in requestJoin.DefaultIfEmpty()
                                   where u.Role == true
                                   select new
                                   {
                                       UserId = u.UserId,
                                       Status = (int?)r.Status,
                                       RequestDate = (DateOnly?)r.RequestDate
                                   };

                if (request.UserId.HasValue)
                    queryRequest = queryRequest.Where(r => r.UserId == request.UserId);

                if (request.StartDate.HasValue || request.EndDate.HasValue)
                    queryRequest = queryRequest.Where(r => (!request.StartDate.HasValue || r.RequestDate >= request.StartDate) && (!request.EndDate.HasValue || r.RequestDate <= request.EndDate));

                var dataRequestList = await queryRequest.ToListAsync();
                var resultRequestWithId = (from d in dataRequestList
                                           group d by d.UserId into g
                                           select new
                                           {
                                               UserId = g.Key,
                                               TotalRequest = g.Count(x => x.Status != null),
                                               TotalReject = g.Count(x => x.Status == (int)RequestStatus.Rejected)
                                           }).ToList();


                var queryReturn = from u in _context.Users
                                  join x in from rt in _context.RequisitionReturns
                                            join h in _context.Histories on rt.ReturnId equals h.ReturnId
                                            select new
                                            {
                                                rt.ResponsibleId,
                                                ReturnDate = h.ReturnDate
                                            } on u.UserId equals x.ResponsibleId into xJoin
                                  from x in xJoin.DefaultIfEmpty()
                                  where u.Role == true
                                  select new
                                  {
                                      UserId = u.UserId,
                                      ReturnDate = x.ReturnDate
                                  };

                if (request.UserId.HasValue)
                    queryRequest = queryRequest.Where(r => r.UserId == request.UserId);

                if (request.StartDate.HasValue || request.EndDate.HasValue)
                    queryReturn = queryReturn.Where(r => (!request.StartDate.HasValue || r.ReturnDate >= request.StartDate) && (!request.EndDate.HasValue || r.ReturnDate <= request.EndDate));

                var dataReturnList = await queryReturn.ToListAsync();
                var resultReturnWithId = (from d in dataReturnList
                                          group d by d.UserId into g
                                          select new
                                          {
                                              UserId = g.Key,
                                              TotalReturn = g.Count(x => x.ReturnDate != null)
                                          }).ToList();

                var resultRequetAndReturn = (from r in resultRequestWithId
                                             join rt in resultReturnWithId on r.UserId equals rt.UserId
                                             select new
                                             {
                                                 UserId = r.UserId,
                                                 TotalRequest = r.TotalRequest,
                                                 TotalReject = r.TotalReject,
                                                 TotalReturn = rt.TotalReturn
                                             }).ToList();

                var queryCategoryName = from u in _context.Users
                                        where resultRequetAndReturn.Select(x => x.UserId).Contains(u.UserId)
                                        select new
                                        {
                                            FirstName = u.FirstName,
                                            LastName = u.LastName,
                                            UserId = u.UserId
                                        };
                var resultWithName = await queryCategoryName.ToListAsync();

                var result = (from r in resultRequetAndReturn
                              join n in resultWithName on r.UserId equals n.UserId
                              select new
                              {
                                  FirstName = n.FirstName,
                                  LastName = n.LastName,
                                  TotalRequest = r.TotalRequest,
                                  TotalReject = r.TotalReject,
                                  TotalReturn = r.TotalReturn
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