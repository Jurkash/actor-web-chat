# Actor Web Chat

The purpose of this project is to demonstrate usage of actor model approach on some non academic samples. Chatting domain is hight suitable area to be modeled as actors due logical split on users/channels/client etc. Moreover real-time messaging covers multiple features of Orleans.

# Technology stack
- React
- ASP.Net Core
- SignalR
- Orleans

# Persistance

There is no data storage currently used. User identity are stored sessions storage. Clients, Channels, Messages are part of Actor state