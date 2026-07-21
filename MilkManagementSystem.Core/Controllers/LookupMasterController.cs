using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Models.Dto;
using Services.Contracts;

namespace api_truckcompanyservice.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LookupMasterController : ControllerBase
    {
        private readonly ILookupMasterService _service;

        public LookupMasterController(ILookupMasterService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Create(LookupMasterDto dto)
        {
            var result = await _service.CreateAsync(dto);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, LookupMasterDto dto)
        {
            var result = await _service.UpdateAsync(id, dto);

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);

            if (!result)
                return NotFound();

            return Ok("Deleted Successfully");
        }
    }
}
