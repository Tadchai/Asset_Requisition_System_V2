using System;
using System.Collections.Generic;

namespace api.Models;

public partial class Instance
{
    public int InstanceId { get; set; }

    public string AssetId { get; set; } = null!;

    public int Status { get; set; }

    public int ClassificationId { get; set; }

    public int? RequestId { get; set; }

    public int? Price { get; set; }

    public string? StoreName { get; set; }

    public bool Preparation { get; set; }

    public DateOnly AcquisitonDate { get; set; }

    public virtual Classification Classification { get; set; } = null!;

    public virtual ICollection<ItemInstanceStatusTimeline> ItemInstanceStatusTimelines { get; set; } = new List<ItemInstanceStatusTimeline>();

    public virtual ICollection<RequisitionRequest> RequisitionRequests { get; set; } = new List<RequisitionRequest>();
}
