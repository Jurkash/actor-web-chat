using System.Net;
using Grains;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Orleans.Configuration;
using Orleans.Hosting;
using Utils;
using Orleans;

namespace Silo
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .UseOrleans(silobuilder =>
                {
                    silobuilder
                        .ConfigureApplicationParts(parts => parts.AddFromApplicationBaseDirectory())
                        //.UseDashboard()
                        .UseLocalhostClustering()
                        .AddMemoryGrainStorage("PubSubStore")
                        .AddSimpleMessageStreamProvider(Constants.ChatRoomStreamProvider);
                });
    }
}
