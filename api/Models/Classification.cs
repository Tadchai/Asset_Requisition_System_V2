using System;
using System.Collections.Generic;

namespace api.Models;

public partial class Classification
{
    public int ClassificationId { get; set; }

    public string Name { get; set; } = null!;

    public int CategoryId { get; set; }

    public string Description { get; set; } = null!;

    public virtual Category Category { get; set; } = null!;

    public virtual ICollection<Instance> Instances { get; set; } = new List<Instance>();
}
