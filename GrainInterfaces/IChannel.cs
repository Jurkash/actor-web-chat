using GrainInterfaces.Models;
using Orleans;
using System;
using System.Threading.Tasks;

namespace GrainInterfaces
{
    public interface IChannel : IGrainWithStringKey
    {
        Task<Guid> Join(string nickname);
        Task UpdateUsername(string oldUsername, string newUsername);
        Task<Guid> Leave(string nickname);
        Task<bool> Send(Message msg);
        Task<Message[]> ReadHistory(int numberOfMessages);
        Task<string[]> GetMembers();
    }
}
