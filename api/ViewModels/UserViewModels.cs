using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace api.ViewModels
{
    public class CreateUserRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public List<int> RoleId { get; set; } = new List<int>();
    }

    public class LoginUserRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }

    public class UpdateUserRequest
    {
        public int UserId { get; set; }
        public string Username { get; set; }
        public string? Password { get; set; }
        public List<int> RoleId { get; set; } = new List<int>();
    }

    public class GetUserResponse
    {
        public int UserId { get; set;}
        public string Username { get; set; }
        public List<string> RoleName { get; set; }
    }
}