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
        private readonly SymmetricSecurityKey _key;
        private readonly EquipmentBorrowingV2Context _context;
        private readonly IConfiguration _config;

        public AuthController(EquipmentBorrowingV2Context context, IConfiguration configuration)
        {
            _context = context;
            _config = configuration;
            _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JwtSettings:SecretKey"]));
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

        private string GenerateJwtToken(string userId, string username, List<string> roles)
        {
            var tokenHandler = new JwtSecurityTokenHandler();

            var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, userId),
                     new Claim(ClaimTypes.Name, username)
                };
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = new SigningCredentials(_key, SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        [HttpPost]
        public async Task<IActionResult> Login([FromBody] LoginUserRequest request)
        {
            try
            {
                var userModel = await _context.Users.SingleOrDefaultAsync(u => u.Username == request.Username);
                if (userModel == null)
                    return BadRequest(new { Message = "Invalid username or password." });

                var verifyResult = VerifyPassword(request.Password, userModel.Salt, userModel.Password);
                if (!verifyResult)
                    return BadRequest(new { Message = "Invalid username or password." });

                var roleModal = await (from r in _context.Roles
                                       join ur in _context.UserRoles on r.RoleId equals ur.RoleId
                                       where ur.UserId == userModel.UserId
                                       select  r.RoleName
                                       ).ToListAsync();

                var token = GenerateJwtToken(userModel.UserId.ToString(), userModel.Username, roleModal);

                return new JsonResult(new MessageResponse {Token = token, Message = "Login successful.", StatusCode = HttpStatusCode.OK });
            }
            catch (Exception ex)
            {
                return new JsonResult(new MessageResponse { Message = $"An error occurred: {ex.Message}", StatusCode = HttpStatusCode.InternalServerError });
            }
        }


    }
}