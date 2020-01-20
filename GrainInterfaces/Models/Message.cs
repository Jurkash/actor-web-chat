using Orleans.Concurrency;
using System;

namespace GrainInterfaces.Models
{
    [Serializable]
    public class Message
    {
        public DateTimeOffset Created { get; set; } = DateTimeOffset.UtcNow;
        public string Author { get; set; } = "Server";
        public string Text { get; set; }

        public Message(string message)
        {
            Text = message;
        }

        public Message(string author, string message)
        {
            Author = author;
            Text = message;
        }
    }
}
