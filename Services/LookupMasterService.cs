using Data.Context;
using Models.Dto;

namespace Services
{
    public class LookupMasterService : ILookupMasterService
    {
        private readonly AuthDbContext _context;

        public LookupMasterService(AuthDbContext context)
        {
            _context = context;
        }

        public async Task<LookupMaster> CreateAsync(LookupMasterDto dto)
        {
            var entity = new LookupMaster
            {
                Code = dto.Code,
                Value = dto.Value
            };

            _context.LookupMasters.Add(entity);
            await _context.SaveChangesAsync();

            return entity;
        }

        public async Task<LookupMaster?> UpdateAsync(int id, LookupMasterDto dto)
        {
            var entity = await _context.LookupMasters.FindAsync(id);

            if (entity == null)
                return null;

            entity.Code = dto.Code;
            entity.Value = dto.Value;

            await _context.SaveChangesAsync();

            return entity;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.LookupMasters.FindAsync(id);

            if (entity == null)
                return false;

            _context.LookupMasters.Remove(entity);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
