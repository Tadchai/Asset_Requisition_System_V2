using System;
using System.Collections.Generic;

namespace api.Models;

public partial class RequisitionRequest
{
    public int RequestId { get; set; }

    public int CategoryId { get; set; }

    public string Requirement { get; set; } = null!;

    public DateTime DueDate { get; set; }

    public string ReasonRequest { get; set; } = null!;

    public string Status { get; set; } = null!;

    public int? InstaceId { get; set; }

    public string? ReasonRejected { get; set; }

    public int RequesterId { get; set; }

    public int? ResponsibleId { get; set; }

    public virtual Category Category { get; set; } = null!;

    public virtual Instance? Instace { get; set; }

    public virtual User Requester { get; set; } = null!;
}
