using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using api.Models;
using api.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace api.Controllers
{
    [ApiController]
    [Route("[controller]/[action]")]
    public class UserController : ControllerBase
    {
        private readonly EquipmentBorrowingV2Context _context;

        public UserController(EquipmentBorrowingV2Context context)
        {
            _context = context;
        }

        static string HashPassword(string password, string salt)
        {
            using (SHA256 sha256Hash = SHA256.Create())
            {
                string passwordWithSalt = password + salt;
                byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(passwordWithSalt));

                StringBuilder builder = new StringBuilder();
                foreach (byte b in bytes)
                {
                    builder.Append(b.ToString("x2"));
                }
                return builder.ToString();
            }
        }

        static bool VerifyPassword(string enteredPassword, string storedSalt, string storedHashedPassword)
        {
            string hashedPassword = HashPassword(enteredPassword, storedSalt);
            return hashedPassword == storedHashedPassword;
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
        {
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    var salt = Guid.NewGuid().ToString();
                    var hashPassword = HashPassword(request.Password, salt);
                    var user = new User
                    {
                        Username = request.Username,
                        Password = hashPassword,
                        Salt = salt,
                    };
                    await _context.Users.AddAsync(user);
                    await _context.SaveChangesAsync();

                    foreach (var role in request.RoleId)
                    {
                        var userRole = new UserRole
                        {
                            UserId = user.UserId,
                            RoleId = role
                        };
                        await _context.UserRoles.AddAsync(userRole);
                    }
                    await _context.SaveChangesAsync();

                    await transaction.CommitAsync();

                    return new JsonResult(new MessageResponse { Message = "User Created successfully.", StatusCode = HttpStatusCode.Created });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
                }
            }
        }

        [HttpPost]
        public async Task<IActionResult> login([FromBody] LoginUserRequest request)
        {
            try
            {
                var userModel = await _context.Users.SingleOrDefaultAsync(u => u.Username == request.Username);
                if (userModel == null)
                    return new JsonResult(new MessageResponse { Message = "Invalid username or password.", StatusCode = HttpStatusCode.BadRequest });

                var verifyResult = VerifyPassword(request.Password,userModel.Salt, userModel.Password );
                if (!verifyResult)
                    return new JsonResult(new MessageResponse { Message = "Invalid username or password.", StatusCode = HttpStatusCode.BadRequest });

                return new JsonResult(new MessageResponse {Id = userModel.UserId, Message = "Login successful.", StatusCode = HttpStatusCode.OK });
            }
            catch (Exception ex)
            {
                return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
            }
        }

        [HttpPost]
        public async Task<IActionResult> UpdateUser([FromBody] UpdateUserRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Username == request.Username && u.UserId != request.UserId))
                return new JsonResult(new MessageResponse { Message = "Name is already in use.", StatusCode = HttpStatusCode.Conflict });

            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    var userModel = await _context.Users.SingleAsync(u => u.UserId == request.UserId);
                    var hashPassword = HashPassword(request.Password, userModel.Salt);

                    userModel.Username = request.Username;
                    userModel.Password = hashPassword;

                    var storedUserRole = await _context.UserRoles.Where(r => r.UserId == request.UserId).Select(r => r.RoleId).ToListAsync();
                    foreach (var newRole in request.RoleId)
                    {
                        if (!storedUserRole.Contains(newRole))
                        {
                            var userRoleModel = new UserRole
                            {
                                UserId = userModel.UserId,
                                RoleId = newRole
                            };
                            await _context.UserRoles.AddAsync(userRoleModel);
                        }
                    }
                    foreach (var role in storedUserRole)
                    {
                        if (!request.RoleId.Contains(role))
                        {
                            var userRoleModel = await _context.UserRoles.SingleAsync(r => r.RoleId == role && r.UserId == request.UserId);
                            _context.UserRoles.Remove(userRoleModel);
                        }
                    }

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    return new JsonResult(new MessageResponse { Message = "User Updated successfully.", StatusCode = HttpStatusCode.OK });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
                }
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetUser()
        {
            var users = await (from u in _context.Users
                               join ur in _context.UserRoles on u.UserId equals ur.UserId
                               join r in _context.Roles on ur.RoleId equals r.RoleId
                               group r.RoleName by u.Username into userGroup
                               select new GetUserResponse
                               {
                                   Username = userGroup.Key,
                                   RoleName = userGroup.ToList()
                               }).ToListAsync();

            return new JsonResult(users);
        }
        [HttpGet]
        public async Task<IActionResult> GetUserNew()
        {
            var queryUserRole = (from u in _context.Users
                                 join ur in _context.UserRoles on u.UserId equals ur.UserId
                                 join r in _context.Roles on ur.RoleId equals r.RoleId
                                 select new
                                 {
                                     u.Username,
                                     r.RoleName
                                 });

            var existingUserWithRole = queryUserRole
                                        .AsEnumerable()
                                        .GroupBy(x => x.Username, x => x.RoleName)
                                        .Select(y => new GetUserResponse
                                        {
                                            Username = y.Key,
                                            RoleName = y.ToList()
                                        })
                                        .ToList();

            return new JsonResult(existingUserWithRole);
        }





    }
}