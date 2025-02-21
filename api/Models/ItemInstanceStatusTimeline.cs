using System;
using System.Collections.Generic;

namespace api.Models;

public partial class ItemInstanceStatusTimeline
{
    public int Id { get; set; }

    public int ItemInstanceId { get; set; }

    public int StatusChange { get; set; }

    public DateOnly Date { get; set; }

    public virtual Instance ItemInstance { get; set; } = null!;
}
