using System;
using System.Collections.Generic;

namespace api.Models;

public partial class RequisitionRequest
{
    public int RequestId { get; set; }

    public int CategoryId { get; set; }

    public string Requirement { get; set; } = null!;

    public DateOnly DueDate { get; set; }

    public string ReasonRequest { get; set; } = null!;

    public int Status { get; set; }

    public int? InstanceId { get; set; }

    public string? ReasonRejected { get; set; }

    public int RequesterId { get; set; }

    public int? ResponsibleId { get; set; }

    public virtual Category Category { get; set; } = null!;

    public virtual Instance? Instance { get; set; }

    public virtual User Requester { get; set; } = null!;

    public virtual ICollection<RequisitionReturn> RequisitionReturns { get; set; } = new List<RequisitionReturn>();

    public virtual User? Responsible { get; set; }
}
