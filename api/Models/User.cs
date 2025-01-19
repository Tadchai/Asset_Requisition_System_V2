using System;
using System.Collections.Generic;

namespace api.Models;

public partial class User
{
    public int UserId { get; set; }

    public string Username { get; set; } = null!;

    public string Password { get; set; } = null!;

    public string Salt { get; set; } = null!;

    public virtual ICollection<RequisitionRequest> RequisitionRequests { get; set; } = new List<RequisitionRequest>();

    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
