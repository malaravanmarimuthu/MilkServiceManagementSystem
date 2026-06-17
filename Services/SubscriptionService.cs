using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Models.Dto;
using Services.Contracts;

namespace Services
{
    public class SubscriptionService(
        IRepositary<Subscription> subscriptionRepository,
        ILogger<SubscriptionService> logger) : ISubscriptionService
    {
        private readonly ILogger<SubscriptionService> _logger = logger;
        private readonly IRepositary<Subscription> _subscriptionRepository = subscriptionRepository;

        public async ValueTask<List<Subscription>> GetAll()
        {
            try
            {
                _logger.LogInformation("Started -> GetAll Subscriptions");

                var subscriptions = await _subscriptionRepository
                    .FindAll()
                    .ToListAsync();

                return subscriptions;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error -> {ex.Message}");
                throw;
            }
            finally
            {
                _logger.LogInformation("Completed -> GetAll Subscriptions");
            }
        }

        public async ValueTask<SubscriptionDto?> GetById(long id)
        {
            try
            {
                _logger.LogInformation($"Started -> GetById Subscription Id: {id}");

                var subscription = await _subscriptionRepository
                    .FindByCondition(x => x.SubscriptionID == id)
                    .FirstOrDefaultAsync();

                if (subscription == null) return null;

                return new SubscriptionDto
                {
                    MilkType = subscription.MilkType,
                    Quantity = subscription.Quantity,
                    PricePerLiter = subscription.PricePerLiter
                };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error -> {ex.Message}");
                throw;
            }
            finally
            {
                _logger.LogInformation($"Completed -> GetById Subscription Id: {id}");
            }
        }

        public async ValueTask<bool> Create(SubscriptionDto dto)
        {
            try
            {
                _logger.LogInformation($"Started -> Create Subscription: {dto.MilkType}");

                var subscription = new Subscription
                {
                    MilkType = dto.MilkType,
                    Quantity = dto.Quantity,
                    PricePerLiter = dto.PricePerLiter
                };

                await _subscriptionRepository.CreateAsync(subscription);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error -> {ex.Message}");
                throw;
            }
            finally
            {
                _logger.LogInformation($"Completed -> Create Subscription: {dto.MilkType}");
            }
        }

        public async ValueTask<bool> Update(long id, SubscriptionDto dto)
        {
            try
            {
                _logger.LogInformation($"Started -> Update Subscription Id: {id}");

                var subscription = await _subscriptionRepository
                    .FindByCondition(x => x.SubscriptionID == id)
                    .FirstOrDefaultAsync();

                if (subscription == null) return false;

                subscription.MilkType = dto.MilkType;
                subscription.Quantity = dto.Quantity;
                subscription.PricePerLiter = dto.PricePerLiter;

                await _subscriptionRepository.UpdateAsync(subscription);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error -> {ex.Message}");
                throw;
            }
            finally
            {
                _logger.LogInformation($"Completed -> Update Subscription Id: {id}");
            }
        }

        public async ValueTask<bool> Delete(long id)
        {
            try
            {
                _logger.LogInformation($"Started -> Delete Subscription Id: {id}");

                var subscription = await _subscriptionRepository
                    .FindByCondition(x => x.SubscriptionID == id)
                    .FirstOrDefaultAsync();

                if (subscription == null) return false;

                await _subscriptionRepository.DeleteAsync(subscription);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error -> {ex.Message}");
                throw;
            }
            finally
            {
                _logger.LogInformation($"Completed -> Delete Subscription Id: {id}");
            }
        }
    }
}