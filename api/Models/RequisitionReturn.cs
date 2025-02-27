﻿using System;
using System.Collections.Generic;

namespace api.Models;

public partial class RequisitionReturn
{
    public int ReturnId { get; set; }

    public string ReasonReturn { get; set; } = null!;

    public int Status { get; set; }

    public int RequestId { get; set; }

    public int? ResponsibleId { get; set; }

    public virtual ICollection<History> Histories { get; set; } = new List<History>();

    public virtual RequisitionRequest Request { get; set; } = null!;

    public virtual User? Responsible { get; set; }
}
