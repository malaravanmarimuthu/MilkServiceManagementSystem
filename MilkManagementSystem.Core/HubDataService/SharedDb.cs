using api_truckcompanyservice.HubModels;
using System.Collections.Concurrent;

namespace api_truckcompanyservice.HubDataService
{
    public class SharedDb
    {
        private readonly ConcurrentDictionary<string, UserConnection> _connection = new();
        public ConcurrentDictionary<string, UserConnection> Connection => _connection;
    }
}
