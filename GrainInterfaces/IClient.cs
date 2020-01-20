using GrainInterfaces.Models;
using Orleans;
using Orleans.Streams;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GrainInterfaces
{
    public interface IClient : IGrainWithStringKey
    {
        Task SetUsername(string userName);
        Task<Guid> JoinChannel(string channelName);
        Task<Guid> LeaveChannel(string channelName);
        Task<Guid[]> LeaveAllChannels();
        Task<string[]> GetChannels();
        Task SendMessage(string channelName, string message);
    }
}
