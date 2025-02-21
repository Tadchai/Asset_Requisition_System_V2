using System;
using System.Collections.Generic;

namespace api.Models;

public partial class Category
{
    public int CategoryId { get; set; }

    public string Name { get; set; } = null!;

    public string Description { get; set; } = null!;

    public string Unit { get; set; } = null!;

    public int ReservedQuantity { get; set; }

    public virtual ICollection<Classification> Classifications { get; set; } = new List<Classification>();

    public virtual ICollection<RequisitionRequest> RequisitionRequests { get; set; } = new List<RequisitionRequest>();
}
