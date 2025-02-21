using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace api.ViewModels
{
    public class UserRequestCountRequest
    {
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public int? UserId { get; set; }
    }

    public class ResponsibleRequestCountRequest
    {
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public int? UserId { get; set; }
    }

    public class GetUserResponse
    {
        public int UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
    }

    public class GetUserNameResponse
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
    }
}