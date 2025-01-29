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
    public class AuthController : ControllerBase
    {
        private readonly EquipmentBorrowingV2Context _context;

        public AuthController(EquipmentBorrowingV2Context context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> CheckSubject()
        {
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    var subjectFromToken = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                    var checkUser = await _context.Users.SingleOrDefaultAsync(u => u.SubjectId == subjectFromToken);
                    if (checkUser == null)
                    {
                        var usernameFromToken = User.FindFirst("name")?.Value;
                        var userModal = new User
                        {
                            Username = usernameFromToken,
                            SubjectId = subjectFromToken
                        };

                        await _context.Users.AddAsync(userModal);

                        await _context.SaveChangesAsync();
                        await transaction.CommitAsync();
                        return new JsonResult(new MessageResponse { Message = "User created successfully.", StatusCode = HttpStatusCode.Created });
                    }
                    return new JsonResult(new MessageResponse { Message = "User already exists.", StatusCode = HttpStatusCode.OK });
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