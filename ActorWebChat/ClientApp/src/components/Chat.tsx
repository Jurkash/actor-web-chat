import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { ApplicationState } from '../store';
import * as ChatStore from '../store/Chat';
import { HubConnectionBuilder } from '@aspnet/signalr'
import { Message } from '../store/models/Message';

type ChatProps =
    ChatStore.ChatState &
    typeof ChatStore.actionCreators &
    RouteComponentProps<{}>

interface IChatRouting {
    routerNickName: string;
}

class Chat extends React.PureComponent<ChatProps> {
    nickChangedFlag = true
    messagesEnd: HTMLDivElement | null = null
    componentDidMount() {
        this.parseNickNameFromUrl();
        this.setupSignalR();
        this.scrollToBottom();
    }
    scrollToBottom = () => {
        setTimeout(() => this.messagesEnd?.scrollIntoView({ behavior: "smooth" }), 75);
    }
    genGuid = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    setupSignalR = () => {
        let access_token = localStorage.getItem("access_token") || ""
        if (!access_token) {
            access_token = this.genGuid()
            localStorage.setItem("access_token", access_token);
        }

        const hubConnection = new HubConnectionBuilder()
            .withUrl("https://localhost:5001/chat-hub", {
                accessTokenFactory: () => access_token
            })
            .build()

        this.props.SetHubConnection(hubConnection);

        hubConnection
            .start()
            .then(() => {
                this.subscribeToHubMessages();
                console.log('Connection started!')
            })
            .catch((err: any) => console.log('Error while establishing connection: ', err))
    }
    subscribeToHubMessages = () => {
        this.setNickName();
        this.getChannels();
        this.joinChannelHandler(this.props.currentChannel);

        this.props.hubConnection.on('send.channels', (channels: string[]) => {
            let currChannels = this.props.channels.filter(c => c.name != "general").map(c => c.name);
            currChannels.forEach(c => this.props.removeChannel(c));
            channels.filter(c => c != "general").forEach(c => this.joinChannelHandler(c));
        });
        this.props.hubConnection.on('send.history', (channelName: string, messages: Message[]) => {
            if (this.props.currentChannel == channelName) {
                this.props.clearMessages();
                messages.forEach(m => {
                    m.created = new Date(m.created);
                    this.props.addMessage(m)
                });
            }
        });
        this.props.hubConnection.on('send.members', (channelName: string, members: string[]) => {
            if (this.props.currentChannel == channelName) {
                this.props.setCurrentChannelMembers(members);
            }
        });
        this.props.hubConnection.on('send.message', (channelName: string, message: Message) => {
            message.created = new Date(message.created);
            if (this.props.currentChannel == channelName) {
                this.props.addMessage(message);
            } else {
                this.props.addUnreadMessage(channelName, message);
            }
        });
    }
    parseNickNameFromUrl = () => {
        if (this.props.match.params) {
            let params = this.props.match.params as IChatRouting;
            if (params.routerNickName) {
                this.props.setNickname(params.routerNickName);
            }
        }
    }
    setNickName = () => {
        if (this.nickChangedFlag) {
            this.props.hubConnection.send("SetUsername", this.props.nickName);
            this.nickChangedFlag = false;
        }
    }
    handleNickNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.props.setNickname(e.target.value)
        this.nickChangedFlag = true;
    }
    handleNickNameFocusLeave = () => {
        this.setNickName();
    }
    handleChannelToJoinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.props.setChannelToJoin(e.target.value);
    }
    joinChannelHandler = (channelName: string) => {
        this.props.hubConnection.send("JoinChannel", channelName)
            .then(() => {
                this.props.addChannel(channelName);
                this.props.setChannelToJoin("");
                this.changeChannelHandler(channelName);
            });
    }
    changeChannelHandler = (channelName: string) => {
        this.props.setCurrentChannel(channelName);
        this.getChannelHistory(channelName);
        this.getChannelMembers(channelName);
        this.props.readMessages(channelName);
    }
    channelClick = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
        this.changeChannelHandler(e.currentTarget.innerText.split('\n')[0] || "general");
    }
    getChannels = () => {
        this.props.hubConnection.send('GetChannels');
    }
    getChannelHistory = (channelName: string) => {
        this.props.hubConnection.send('GetChannelHistory', channelName);
    }
    getChannelMembers = (channelName: string) => {
        this.props.hubConnection.send('GetChannelMembers', channelName);
    }
    joinChannelClick = () => {
        this.joinChannelHandler(this.props.channelToJoin);
    }
    leaveChannelClick = () => {
        this.props.hubConnection.send('LeftChannel', this.props.currentChannel);
        this.props.removeChannel(this.props.currentChannel);
        this.changeChannelHandler("general");
    }
    handleMessageKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            this.sendMessageHandler();
        }
    }
    handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.props.setMessage(e.target.value);
    }
    sendMessageClick = () => {
        this.sendMessageHandler();
    }
    sendMessageHandler = () => {
        const currentMessage = this.props.message;
        if (currentMessage) {
            let messageDTO = new Message(this.props.nickName, currentMessage);
            this.props.hubConnection.send("SendMessage", this.props.currentChannel, messageDTO.text)
                .then(() => {
                    console.log(currentMessage + " successfully sent")
                    this.props.setMessage("");
                    this.scrollToBottom();
                })
                .catch((err: any) => console.log(currentMessage + " failed to sent: ", err));
        }
    }
    public render() {
        return (
            <React.Fragment>
                <h1>Actor Chat</h1>

                {/* username */}
                <div className="input-group mb-3">
                    <div className="input-group-prepend">
                        <span className="input-group-text" id="basic-addon1">@</span>
                    </div>
                    <input type="text" className="form-control" placeholder="Username" aria-label="Username" aria-describedby="basic-addon1"
                        value={this.props.nickName}
                        onChange={this.handleNickNameChange}
                        onBlur={this.handleNickNameFocusLeave} />
                </div>

                {/* join channel */}
                <div className="input-group mb-3">
                    <div className="input-group-prepend">
                        <span className="input-group-text" id="basic-addon1">Channel</span>
                    </div>
                    <input type="text" className="form-control" placeholder="Name" aria-label="Name" aria-describedby="basic-addon1"
                        value={this.props.channelToJoin}
                        onChange={this.handleChannelToJoinChange} />
                    <div className="input-group-append">
                        <button className="btn btn-success" type="button" id="button-send" onClick={this.joinChannelClick}>Join</button>
                    </div>
                </div>

                {/* wrapper */}
                <div style={{ display: "grid", gridTemplateColumns: "15em auto" }}>
                    {/* left column */}
                    <ul className="list-group" style={{ gridColumn: "1" }}>
                        {this.props.channels.map(channel => (
                            <li onClick={this.channelClick}
                                className={"list-group-item d-flex justify-content-between align-items-center" + (this.props.currentChannel == channel.name ? " list-group-item-success" : "")}
                                style={{ cursor: "pointer", marginRight: "5px" }}>
                                {channel.name}
                                <span hidden={channel.unread <= 0} className="badge badge-success badge-pill">{channel.unread}</span>
                            </li>
                        ))}
                    </ul>


                    {/* right column */}
                    <div style={{ gridColumn: "2" }}>
                        {/* members */}
                        <div className="input-group mb-3">
                            <input type="text" className="form-control" placeholder="Members" aria-label="Members" aria-describedby="button-send" disabled={true}
                                value={this.props.currentChannelMembers.join(',')} />
                            <div className="input-group-append">
                                <button className="btn btn-success" type="button" id="button-send" onClick={this.leaveChannelClick} disabled={this.props.currentChannel == "general"}>Leave</button>
                            </div>
                        </div>

                        {/* chat view */}
                        <div style={{ overflowY: "scroll", height: "500px" }}>
                            {this.props.messages.map(item => (
                                <div>{(item.created as Date).toISOString()}{" <"}{item.author}{">: "} {item.text}</div>
                            ))}
                            <div ref={(el) => { this.messagesEnd = el; }}></div>
                        </div>

                        {/* send message bar */}
                        <div className="input-group mb-3">
                            <input type="text" className="form-control" placeholder="Write a message..." aria-label="Message" aria-describedby="button-send"
                                value={this.props.message}
                                onChange={this.handleMessageChange}
                                onKeyPress={this.handleMessageKeyPress} />
                            <div className="input-group-append">
                                <button className="btn btn-success" type="button" id="button-send" onClick={this.sendMessageClick}>Send</button>
                            </div>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
};

export default connect(
    (state: ApplicationState) => state.chat,
    ChatStore.actionCreators
)(Chat);
