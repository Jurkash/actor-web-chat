using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace ActorWebChat.Orleans
{
    public static class OrleansExtensions
    {
        public static void AddOrleans(this IServiceCollection services)
        {
            services.AddSingleton<ClusterClientHostedService>();
            services.AddSingleton<IHostedService>(_ => _.GetService<ClusterClientHostedService>());
            services.AddSingleton(_ => _.GetService<ClusterClientHostedService>().Client);
        }
    }
}
