using GrainInterfaces.Models;
using Microsoft.AspNetCore.SignalR;
using Orleans.Streams;
using System;
using System.Threading.Tasks;

namespace ActorWebChat.SignalR
{
    public class StreamObserver : IAsyncObserver<Message>
    {
        private readonly IHubCallerClients _clients;
        private readonly string _connectionId;
        private readonly string _channelName;

        public StreamObserver(IHubCallerClients hubContext, string connectionId, string channelName)
        {
            _clients = hubContext;
            _connectionId = connectionId;
            _channelName = channelName;
        }

        public Task OnCompletedAsync()
        {
            return Task.CompletedTask;
        }

        public Task OnErrorAsync(Exception ex)
        {
            return Task.CompletedTask;
        }

        public async Task OnNextAsync(Message item, StreamSequenceToken token = null)
        {
            await _clients.Client(_connectionId).SendAsync("send.message", _channelName, item);
        }
    }
}
