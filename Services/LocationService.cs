using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Models.Dto;
using Services.Contracts;

namespace Services
{
    public class LocationService(
        IRepositary<Location> locationRepository,
        ILogger<LocationService> logger) : ILocationService
    {
        private readonly ILogger<LocationService> _logger = logger;
        private readonly IRepositary<Location> _locationRepository = locationRepository;

        public async ValueTask<List<Location>> GetAll()
        {
            try
            {
                _logger.LogInformation("Started -> GetAll Locations");

                var locations = await _locationRepository
                    .FindAll()
                    .ToListAsync();

                return locations;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error -> {ex.Message}");
                throw;
            }
            finally
            {
                _logger.LogInformation("Completed -> GetAll Locations");
            }
        }

        public async ValueTask<LocationDto?> GetById(long id)
        {
            try
            {
                _logger.LogInformation($"Started -> GetById Location Id: {id}");

                var location = await _locationRepository
                    .FindByCondition(x => x.LocationID == id)
                    .FirstOrDefaultAsync();

                if (location == null) return null;

                return new LocationDto
                {
                    LocationId = location.LocationID,
                    LocationName = location.LocationName,
                    Street = location.Street,
                    PinCode = location.PinCode
                };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error -> {ex.Message}");
                throw;
            }
            finally
            {
                _logger.LogInformation($"Completed -> GetById Location Id: {id}");
            }
        }

        public async ValueTask<bool> Create(LocationDto dto)
        {
            try
            {
                _logger.LogInformation($"Started -> Create Location: {dto.LocationName}");

                var location = new Location
                {
                    LocationName = dto.LocationName,
                    Street = dto.Street,
                    PinCode = dto.PinCode
                };

                await _locationRepository.CreateAsync(location);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error -> {ex.Message}");
                throw;
            }
            finally
            {
                _logger.LogInformation($"Completed -> Create Location: {dto.LocationName}");
            }
        }

        public async ValueTask<bool> Update(long id, LocationDto dto)
        {
            try
            {
                _logger.LogInformation($"Started -> Update Location Id: {id}");

                var location = await _locationRepository
                    .FindByCondition(x => x.LocationID == id)
                    .FirstOrDefaultAsync();

                if (location == null) return false;

                location.LocationName = dto.LocationName;
                location.Street = dto.Street;
                location.PinCode = dto.PinCode;

                await _locationRepository.UpdateAsync(location);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error -> {ex.Message}");
                throw;
            }
            finally
            {
                _logger.LogInformation($"Completed -> Update Location Id: {id}");
            }
        }

        public async ValueTask<bool> Delete(long id)
        {
            try
            {
                _logger.LogInformation($"Started -> Delete Location Id: {id}");

                var location = await _locationRepository
                    .FindByCondition(x => x.LocationID == id)
                    .FirstOrDefaultAsync();

                if (location == null) return false;

                await _locationRepository.DeleteAsync(location);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error -> {ex.Message}");
                throw;
            }
            finally
            {
                _logger.LogInformation($"Completed -> Delete Location Id: {id}");
            }
        }
    }
}