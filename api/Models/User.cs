using System;
using System.Collections.Generic;

namespace api.Models;

public partial class User
{
    public int UserId { get; set; }

    public string Username { get; set; } = null!;

    public string SubjectId { get; set; } = null!;

    public virtual ICollection<RequisitionRequest> RequisitionRequestRequesters { get; set; } = new List<RequisitionRequest>();

    public virtual ICollection<RequisitionRequest> RequisitionRequestResponsibles { get; set; } = new List<RequisitionRequest>();

    public virtual ICollection<RequisitionReturn> RequisitionReturns { get; set; } = new List<RequisitionReturn>();
}
