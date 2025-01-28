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
        public string CategoryName { get; set; }
        public string Requirement { get; set; }
        public DateOnly DueDate { get; set; }
        public string ReasonRequest { get; set; }
        public string Status { get; set; }
        public string? AssetId { get; set; }
        public string? ReasonRejected { get; set; }
    }

    public class SetRequest
    {
        public int RequestId { get; set; }
        public RequestStatus Status { get; set; }
        public int? InstanceId { get; set; }
        public string? ReasonRejected { get; set; }
        public int ResponsibleId { get; set; }
    }

    public class GetRequestListResponse
    {
        public string Username { get; set; }
        public string CategoryName { get; set;}
        public string Requirement { get; set; }
        public DateOnly DueDate { get; set; }
        public string ReasonRequest { get; set; }
        public string Status { get; set; }
        public int RequestId { get; set; }
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
    }

    public class CreateReturnAssetRequest
    {
        public int InstanceId { get; set; }
        public string ReasonReturn { get; set; }
    }

    public class GetReturnAssetListResponse
    {
        public string Username { get; set; }
        public string CategoryName { get; set; }
        public string ClassificationName{ get; set; }
        public string AssetId { get; set; }
        public string ReasonReturn { get; set; }
        public string Status { get; set; }
        public int InstanceId { get; set;}
        public int ReturnId { get; set; }
    }

    public class ConfirmReturnAssetRequest
    { 
        public int InstanceId { get; set; }
        public int ReturnId { get; set; }
        public int ResponsibleId { get; set; }
    }
}