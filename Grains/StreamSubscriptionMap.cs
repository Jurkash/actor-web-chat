using GrainInterfaces;
using Orleans;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Grains
{
    public class StreamSubscriptionMap : Grain, IStreamSubscriptionMap
    {
        private readonly Dictionary<string, List<Guid>> _map = new Dictionary<string, List<Guid>>();

        public Task AddSubscription(string clientId, Guid handlerId)
        {
            if (!_map.ContainsKey(clientId))
            { 
                _map.Add(clientId, new List<Guid>());
            }

            _map[clientId].Add(handlerId);

            return Task.CompletedTask;
        }

        public Task<Guid[]> GetHandlerIds(string clientId)
        {
            if(_map.TryGetValue(clientId, out var handlers))
            {
                return Task.FromResult(handlers.ToArray());
            }
            return Task.FromResult(new Guid[0]);
        }

        public Task RemoveSubscription(string clientId, Guid handlerId)
        {
            if (_map.ContainsKey(clientId))
            {
                _map[clientId].Remove(handlerId);
            }

            return Task.CompletedTask;
        }
    }
}
