using GrainInterfaces;
using GrainInterfaces.Models;
using Orleans;
using Orleans.Streams;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Utils;

namespace Grains
{
    public class Client : Grain, IClient
    {
        private readonly HashSet<string> _channels = new HashSet<string>();
        private readonly List<Guid> _streamSubscriptions = new List<Guid>();
        private string _userName = "";

        public async Task<Guid> JoinChannel(string channelName)
        {
            _channels.Add(channelName);

            var channel = GrainFactory.GetGrain<IChannel>(channelName);

            return await channel.Join(_userName);
        }

        public async Task<Guid> LeaveChannel(string channelName)
        {
            var channel = GrainFactory.GetGrain<IChannel>(channelName);

            var streamId = await channel.Leave(_userName);

            return streamId;
        }

        public async Task<Guid[]> LeaveAllChannels()
        {
            var streamIds = new List<Guid>();
            foreach (var channelName in _channels)
            {
                var channel = GrainFactory.GetGrain<IChannel>(channelName);
                var streamId = await channel.Leave(_userName);
                streamIds.Add(streamId);
            }
            return streamIds.ToArray();
        }

        public async Task SetUsername(string username)
        {
            foreach (var channelName in _channels)
            {
                var channel = GrainFactory.GetGrain<IChannel>(channelName);
                await channel.UpdateUsername(_userName, username);
            }
            _userName = username;
        }

        public async Task SendMessage(string channelName, string message)
        {
            var channel = GrainFactory.GetGrain<IChannel>(channelName);

            await channel.Send(new Message(_userName, message));
        }

        public Task<string[]> GetChannels()
        {
            var channels = new List<string>();
            foreach (var item in _channels)
            {
                channels.Add(item);
            }
            return Task.FromResult(channels.ToArray());
        }
    }
}
