using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ActorWebChat.SignalR
{
    public static class SignalrExtensions
    {
        public static string GetAccessToken(this HubCallerContext context)
        {
            return context.Items["access_token"].ToString();
        }

        public static void SetAccessToken(this HubCallerContext context, string accessToken)
        {
            context.Items.Add("access_token", accessToken);
        }
    }
}
