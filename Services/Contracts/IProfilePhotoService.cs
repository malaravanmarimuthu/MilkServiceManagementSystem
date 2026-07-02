using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Contracts
{
    public interface IProfilePhotoService
    {
        Task<string> UploadAsync(int employeeId, IFormFile file);
        Task<string> UpdateAsync(int employeeId, IFormFile file); 
        Task<string?> GetPhotoUrlAsync(int employeeId);
        Task DeleteAsync(int employeeId);
    }
}
