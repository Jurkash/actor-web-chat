using GrainInterfaces;
using GrainInterfaces.Models;
using Orleans;
using Orleans.Streams;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Utils;

namespace Grains
{
    public class Channel : Grain, IChannel
    {
        private readonly List<string> _onlineMembers = new List<string>();
        private readonly List<Message> _messages = new List<Message>();

        private IAsyncStream<Message> _stream;

        public override Task OnActivateAsync()
        {
            _stream = GetStreamProvider(Constants.ChatRoomStreamProvider)
                .GetStream<Message>(Guid.NewGuid(), Constants.CharRoomStreamNameSpace);

            return base.OnActivateAsync();
        }

        public Task<string[]> GetMembers()
        {
            return Task.FromResult(_onlineMembers.ToArray());
        }

        public async Task<Guid> Join(string nickname)
        {
            _onlineMembers.Add(nickname);

            await _stream.OnNextAsync(new Message($"{nickname} has joined the channel"));

            return _stream.Guid;
        }

        public async Task UpdateUsername(string oldUsername, string newUsername)
        {
            if (_onlineMembers.Remove(oldUsername))
            {
                _onlineMembers.Add(newUsername);
            }

            await _stream.OnNextAsync(new Message($"{oldUsername} has changed username to {newUsername}"));
        }

        public async Task<Guid> Leave(string nickname)
        {
            _onlineMembers.Remove(nickname);

            await _stream.OnNextAsync(new Message($"{nickname} has left the channel"));

            return _stream.Guid;
        }

        public async Task<bool> Send(Message msg)
        {
            _messages.Add(msg);

            await _stream.OnNextAsync(msg);

            return true;
        }

        public Task<Message[]> ReadHistory(int numberOfMessages)
        {
            var result = _messages
                .OrderByDescending(m => m.Created)
                .Take(numberOfMessages)
                .Reverse()
                .ToArray();

            return Task.FromResult(result);
        }
    }
}
