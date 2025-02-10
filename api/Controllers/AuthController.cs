using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using api.Models;
using api.ViewModels;
using IdentityModel.Client;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;


namespace api.Controllers
{
    [ApiController]
    [Route("[controller]/[action]")]
    [Authorize]
    public class AuthController : ControllerBase
    {
        private readonly EquipmentBorrowingV2Context _context;

        public AuthController(EquipmentBorrowingV2Context context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> UpsertUser()
        {
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    var subjectFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                    var firstNameFromToken = User.FindFirst(ClaimTypes.GivenName)?.Value;
                    var lastNameFromToken = User.FindFirst(ClaimTypes.Surname)?.Value;
                    var roleFromToken = User.FindFirst("realm_access")?.Value;
                    
                    var userModal = await _context.Users.SingleOrDefaultAsync(u => u.SubjectId == subjectFromToken);
                    if (userModal == null)
                    {
                        var newUserModal = new User
                        {
                            FirstName = firstNameFromToken,
                            LastName = lastNameFromToken,
                            SubjectId = subjectFromToken,
                            Role = roleFromToken.Contains("procurement") ? true : false
                        };

                        await _context.Users.AddAsync(newUserModal);

                        await _context.SaveChangesAsync();
                        await transaction.CommitAsync();
                        return new JsonResult(new MessageResponse { Message = "User created successfully.", StatusCode = HttpStatusCode.Created });
                    }
                    else
                    {
                        userModal.FirstName = firstNameFromToken;
                        userModal.LastName = lastNameFromToken;
                        userModal.Role = roleFromToken.Contains("procurement") ? true : false;

                        await _context.SaveChangesAsync();
                        await transaction.CommitAsync();
                        return new JsonResult(new MessageResponse { Message = "User update successfully.", StatusCode = HttpStatusCode.OK });
                    }
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
                }

            }
        }





    }

}