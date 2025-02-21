using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace api.ViewModels
{
    public enum RequestStatus
    {
        Pending,
        Allocated,
        Rejected,
        Completed
    }
    public enum ReturnStatus
    {
        Pending,
        Completed
    }
    public class CreateRequisitionRequest
    {
        public int CategoryId { get; set; }
        public string Requirement { get; set; }
        public DateOnly DueDate { get; set; }
        public string ReasonRequest { get; set; }
    }

    public class GetRequestResponse
    {
        public int RequestId { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; }
        public string Requirement { get; set; }
        public DateOnly DueDate { get; set; }
        public string ReasonRequest { get; set; }
        public int Status { get; set; }
        public string? AssetId { get; set; }
        public string? ReasonRejected { get; set; }
        public string? ResponsibleFirstName { get; set; }
        public string? ResponsibleLastName { get; set; }
    }

    public class SetRequest
    {
        public int RequestId { get; set; }
        public RequestStatus Status { get; set; }
        public int? InstanceId { get; set; }
        public string? ReasonRejected { get; set; }
    }

    public class GetRequestListResponse
    {
        public int UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; }
        public string Requirement { get; set; }
        public DateOnly DueDate { get; set; }
        public string ReasonRequest { get; set; }
        public int Status { get; set; }
        public int RequestId { get; set; }
        public int? ResponsibleId { get; set; }
        public string? FirstNameResponsible { get; set; }
        public string? LastNameResponsible { get; set; }
    }

    public class ConfirmRequest
    {
        public int RequestId { get; set; }
    }

    public class ConfirmListResponse
    {
        public int RequestId { get; set; }
        public string CategoryName { get; set; }
        public string ClassificationName { get; set; }
        public string AssetId { get; set; }
    }

    public class AssetListResponse
    {
        public int RequestId { get; set; }
        public string CategoryName { get; set; }
        public string ClassificationName { get; set; }
        public string AssetId { get; set; }
        public int InstanceId { get; set; }
        public bool HasReturn { get; set; }
    }

    public class CreateReturnAssetRequest
    {
        public int InstanceId { get; set; }
        public string ReasonReturn { get; set; }
    }

    public class GetReturnAssetListResponse
    {
        public int UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; }
        public string ClassificationName { get; set; }
        public string AssetId { get; set; }
        public string ReasonReturn { get; set; }
        public int Status { get; set; }
        public int ReturnId { get; set; }
        public int? ResponsibleId { get; set; }
        public string? FirstNameResponsible { get; set; }
        public string? LastNameResponsible { get; set; }
    }
    public class GetPendingReturnResponse
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string CategoryName { get; set; }
        public string ClassificationName { get; set; }
        public string AssetId { get; set; }
        public string ReasonReturn { get; set; }
        public int ReturnId { get; set; }
        public int InstanceId { get; set; }
    }

    public class ConfirmReturnAssetRequest
    {
        public int InstanceId { get; set; }
        public int ReturnId { get; set; }
    }

    public class PendingRequestRequest
    {
        public DateOnly? DayNextCursor { get; set; }
        public int? NextCursor { get; set; }
        public int PageSize { get; set; }
    }
    public class AllocatedRequestRequest
    {
        public DateOnly? DayNextCursor { get; set; }
        public int? NextCursor { get; set; }
        public int PageSize { get; set; }
    }

    public class ReturnListRequest
    {
        public int PageSize { get; set; }
        public int? PreviousCursor { get; set; }
        public int? NextCursor { get; set; }
        public int? ReturnId { get; set; }
        public int? UserId { get; set; }
        public int? CategoryId { get; set; }
        public int? Status { get; set; }
        public int? ResponsibleId { get; set; }
    }

    public class GetRequestRequest
    {
        public int PageSize { get; set; }
        public int? PreviousCursor { get; set; }
        public int? NextCursor { get; set; }
        public int? RequestId { get; set; }
        public int? CategoryId { get; set; }
        public int? Status { get; set; }
        public DateOnly? StartDueDate { get; set; }
        public DateOnly? EndDueDate { get; set; }
    }

    public class GetConfirmListRequest
    {
        public int PageSize { get; set; }
        public int? PreviousCursor { get; set; }
        public int? NextCursor { get; set; }
    }

    public class RequestListRequest
    {
        public int PageSize { get; set; }
        public int? PreviousCursor { get; set; }
        public int? NextCursor { get; set; }
        public int? RequestId { get; set; }
        public int? UserId { get; set; }
        public int? CategoryId { get; set; }
        public DateOnly? StartDueDate { get; set; }
        public DateOnly? EndDueDate { get; set; }
        public int? Status { get; set; }
        public int? ResponsibleId { get; set; }
    }
}