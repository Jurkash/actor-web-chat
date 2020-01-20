using Orleans;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GrainInterfaces
{
    public interface IStreamSubscriptionMap: IGrainWithStringKey
    {
        Task AddSubscription(string clientId, Guid handlerId);

        Task RemoveSubscription(string clientId, Guid handlerId);

        Task<Guid[]> GetHandlerIds(string clientId);
    }
}
