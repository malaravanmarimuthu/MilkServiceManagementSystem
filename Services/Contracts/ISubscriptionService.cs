using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Models.Dto;

namespace Services.Contracts
{
    public interface ISubscriptionService
    {
        ValueTask<List<Subscription>> GetAll();
        ValueTask<SubscriptionDto?> GetById(long id);
        ValueTask<bool> Create(SubscriptionDto dto);
        ValueTask<bool> Update(long id, SubscriptionDto dto);
        ValueTask<bool> Delete(long id);
    }
}