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
    public class CreateRequisitionRequest
    {
        public int CategoryId { get; set; }
        public string Requirement { get; set; }
        public DateTime DueDate { get; set; }
        public string ReasonRequest { get; set; }
        public int RequesterId { get; set; }
    }

    public class GetReasonRequestResponse
    {
        public string CategoryName { get; set; }
        public string Requirement { get; set; }
        public DateTime DueDate { get; set; }
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
}