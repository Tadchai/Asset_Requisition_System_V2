using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace api.ViewModels
{
    public enum HttpStatusCode
    {
        OK = 200,
        Created = 201,
        BadRequest = 400,
        Unauthorized = 401,
        Forbidden = 403,
        NotFound = 404,
        Conflict = 409,
        InternalServerError = 500
    }
    public class MessageResponse
    {
        public int? Id { get; set; }
        public string Message { get; set; }
        public HttpStatusCode StatusCode { get; set; }
    }

    public class PaginatedRequest
    {
        public int PageSize { get; set; }
        public int Page { get; set; }
    }

    public class PaginatedResponse<T>
    {
        public bool HasNextPage { get; set; }
        public DateOnly? DayNextCursor { get; set; }
        public int ItemTotal { get; set; }
        public int TotalRow { get; set; }
        public int PreviousCursor { get; set; }
        public int? NextCursor { get; set; }
        public int TotalBefore { get; set; }
        public int TotalAfter { get; set; }
        public T? Data { get; set; }
    }

    public class PendingReturnRequest
    {
        public int? NextCursor { get; set; }
        public int PageSize { get; set; }
    }

    public class GetUserRequest
    {
        public int UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
    }

    public class GetUserNameRequest
    {
        public int UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
    }




}