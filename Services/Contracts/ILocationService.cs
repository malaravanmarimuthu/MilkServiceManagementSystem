using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Models.Dto;

namespace Services.Contracts
{
    public interface ILocationService
    {
        ValueTask<List<Location>> GetAll();
        ValueTask<LocationDto?> GetById(long id);
        ValueTask<bool> Create(LocationDto dto);
        ValueTask<bool> Update(long id, LocationDto dto);
        ValueTask<bool> Delete(long id);
    }
}