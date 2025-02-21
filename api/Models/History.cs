using System;
using System.Collections.Generic;

namespace api.Models;

public partial class History
{
    public int Id { get; set; }

    public int RequestId { get; set; }

    public DateOnly RequestDate { get; set; }

    public DateOnly? ResponseRequestDate { get; set; }

    public int? ReturnId { get; set; }

    public DateOnly? ReturnDate { get; set; }

    public DateOnly? ResponseReturnDate { get; set; }

    public virtual RequisitionRequest Request { get; set; } = null!;

    public virtual RequisitionReturn? Return { get; set; }
}
