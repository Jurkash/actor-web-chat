using GrainInterfaces;
using GrainInterfaces.Models;
using Microsoft.AspNetCore.SignalR;
using Orleans;
using System;
using System.Linq;
using System.Threading.Tasks;
using Utils;

namespace ActorWebChat.SignalR
{
    public class ChatHub : Hub
    {
        private readonly IClusterClient _orleansClient;

        public ChatHub(IClusterClient clusterClient)
        {
            _orleansClient = clusterClient;
        }

        public override async Task OnConnectedAsync()
        {
            var httpContext = Context.GetHttpContext();

            Context.SetAccessToken(httpContext.Request.Query["access_token"]);

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var client = _orleansClient.GetGrain<IClient>(Context.GetAccessToken());

            var streamIds = await client.LeaveAllChannels();

            foreach (var streamId in streamIds)
            {
                await UnsubscribeFromStream(streamId);
            }

            await base.OnDisconnectedAsync(exception);
        }

        public async Task GetChannelHistory(string channelName)
        {
            var channel = _orleansClient.GetGrain<IChannel>(channelName);
            var history = await channel.ReadHistory(1000);
            await Clients.Client(Context.ConnectionId).SendAsync("send.history", channelName, history);
        }

        public async Task GetChannels()
        {
            var client = _orleansClient.GetGrain<IClient>(Context.GetAccessToken());
            var channels = await client.GetChannels();
            await Clients.Client(Context.ConnectionId).SendAsync("send.channels", channels);
        }

        public async Task GetChannelMembers(string channelName)
        {
            var channel = _orleansClient.GetGrain<IChannel>(channelName);
            var members = await channel.GetMembers();
            await Clients.Client(Context.ConnectionId).SendAsync("send.members", channelName, members);
        }

        public async Task JoinChannel(string channelName)
        {
            var client = _orleansClient.GetGrain<IClient>(Context.GetAccessToken());

            var streamId = await client.JoinChannel(channelName);

            var streamSubscription = await _orleansClient.GetStreamProvider(Constants.ChatRoomStreamProvider)
               .GetStream<Message>(streamId, Constants.CharRoomStreamNameSpace)
               .SubscribeAsync(new StreamObserver(Clients, Context.ConnectionId, channelName));

            await _orleansClient.GetGrain<IStreamSubscriptionMap>(Constants.ClusterId)
                .AddSubscription(Context.GetAccessToken(), streamSubscription.HandleId);
        }

        public async Task LeftChannel(string channelName)
        {
            var client = _orleansClient.GetGrain<IClient>(Context.GetAccessToken());

            var streamId = await client.LeaveChannel(channelName);

            await UnsubscribeFromStream(streamId);
        }

        public async Task SetUsername(string username)
        {
            var client = _orleansClient.GetGrain<IClient>(Context.GetAccessToken());

            await client.SetUsername(username);
        }

        public async Task SendMessage(string channelName, string message)
        {
            var client = _orleansClient.GetGrain<IClient>(Context.GetAccessToken());

            await client.SendMessage(channelName, message);
        }

        private async Task UnsubscribeFromStream(Guid streamId)
        {
            var streamSubscriptions = await _orleansClient.GetStreamProvider(Constants.ChatRoomStreamProvider)
                            .GetStream<Message>(streamId, Constants.CharRoomStreamNameSpace)
                            .GetAllSubscriptionHandles();

            var mapGrain = _orleansClient.GetGrain<IStreamSubscriptionMap>(Constants.ClusterId);

            var handlers = await mapGrain.GetHandlerIds(Context.GetAccessToken());
            foreach (var handle in streamSubscriptions)
            {

                if (handlers.Contains(handle.HandleId))
                {
                    await handle.UnsubscribeAsync();
                    await mapGrain.RemoveSubscription(Context.GetAccessToken(), handle.HandleId);
                }
            }
        }
    }
}
