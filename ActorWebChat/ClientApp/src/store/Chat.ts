import { Action, Reducer } from 'redux';
import { HubConnection } from '@aspnet/signalr';
import { Message } from './models/Message';
import { Channel } from './models/Channel';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface ChatState {
    hubConnection: HubConnection;
    nickName: string;
    message: string;
    messages: Message[];
    channelToJoin: string;
    currentChannel: string;
    currentChannelMembers: string[];
    channels: Channel[]
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.
// Use @typeName and isActionType for type detection that works even after serialization/deserialization.

export interface SetHubConnectionAction { type: 'SET_HUB_CONNECTION', value: HubConnection }
export interface SetNickNameAction { type: 'SET_NICKNAME', value: string }
export interface SetMessageAction { type: 'SET_MESSAGE', value: string }
export interface AddMessageAction { type: 'ADD_MESSAGE', value: Message }
export interface ClearMessagesAction {type: 'CLEAR_MESSAGES'}
export interface SetChannelToJoinAction { type: 'SET_CHANNEL_TO_JOIN', value: string } 
export interface SetCurrentChannelAction { type: 'SET_CURRENT_CHANNEL', value: string } 
export interface SetCurrentChannelMembersAction { type: 'SET_CURRENT_CHANNEL_MEMBERS', value: string[] } 
export interface AddChannelAction { type: 'ADD_CHANNEL', value: string } 
export interface RemoveChannelAction { type: 'REMOVE_CHANNEL', value: string } 
export interface AddUnreadMessageAction { type: 'ADD_UNREAD_MESSAGE', channel: string, message: Message } 
export interface ReadMessagesAction { type: 'READ_MESSAGES', channel: string } 


// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
export type KnownAction = SetNickNameAction 
    | AddMessageAction 
    | ClearMessagesAction
    | SetMessageAction 
    | SetHubConnectionAction 
    | SetChannelToJoinAction 
    | SetCurrentChannelAction 
    | SetCurrentChannelMembersAction
    | AddChannelAction
    | RemoveChannelAction
    | AddUnreadMessageAction
    | ReadMessagesAction

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    SetHubConnection: (connection: HubConnection) => ({ type: 'SET_HUB_CONNECTION', value: connection} as SetHubConnectionAction),
    setNickname: (nickName: string) => ({ type: 'SET_NICKNAME', value: nickName } as SetNickNameAction),
    setMessage: (message: string) => ({ type: 'SET_MESSAGE', value: message } as SetMessageAction),
    addMessage: (message: Message) => ({ type: 'ADD_MESSAGE', value: message } as AddMessageAction),
    clearMessages: () => ({type: 'CLEAR_MESSAGES'} as ClearMessagesAction),
    setChannelToJoin: (channeName: string) => ({type: 'SET_CHANNEL_TO_JOIN', value: channeName} as SetChannelToJoinAction),
    setCurrentChannel: (channelName: string) => ({type: 'SET_CURRENT_CHANNEL', value: channelName} as SetCurrentChannelAction),
    setCurrentChannelMembers: (members: string[]) => ({type: 'SET_CURRENT_CHANNEL_MEMBERS', value: members} as SetCurrentChannelMembersAction),
    addChannel: (channelName: string) => ({type: 'ADD_CHANNEL', value: channelName} as AddChannelAction),
    removeChannel: (channelName: string) => ({type: 'REMOVE_CHANNEL', value: channelName} as RemoveChannelAction),
    addUnreadMessage: (channel: string, message: Message) => ({type: 'ADD_UNREAD_MESSAGE', channel: channel, message: message} as AddUnreadMessageAction),
    readMessages: (channel: string) => ({type: 'READ_MESSAGES', channel: channel } as ReadMessagesAction)
};

// ----------------
// REDUCER - For a given state and action, returns the new state. To support time travel, this must not mutate the old state.

export const reducer: Reducer<ChatState> = (state: ChatState | undefined, incomingAction: Action): ChatState => {
    if (state === undefined) {
        return { 
            hubConnection: HubConnection.prototype,
            nickName: "unknown", 
            message: "",
            messages: [],
            channelToJoin: "",
            currentChannel: "general",
            currentChannelMembers: [],
            channels: []
        };
    }

    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'SET_HUB_CONNECTION':
            return {...state, hubConnection: action.value};
        case 'SET_NICKNAME':
            return !action.value 
                ? { ...state, nickName: "unknown" } 
                : { ...state, nickName: action.value };
        case 'SET_MESSAGE':
            return {...state, message: action.value };
        case 'ADD_MESSAGE':
            return { 
                ...state, 
                messages: [...state.messages, action.value] };
        case 'CLEAR_MESSAGES':
            return {
                ...state,
                messages: []
            }
        case 'SET_CHANNEL_TO_JOIN':
            return{ ...state, channelToJoin: action.value }
        case 'SET_CURRENT_CHANNEL':
            return { ...state, currentChannel: action.value }
        case 'SET_CURRENT_CHANNEL_MEMBERS':
            return { ...state, currentChannelMembers: action.value }
        case 'ADD_CHANNEL':
            return { 
                ...state, 
                channels: [...state.channels, new Channel(action.value, 0)]
            }
        case 'REMOVE_CHANNEL':
            return { ... state, channels: state.channels.filter(c => c.name != action.value)}
        case 'ADD_UNREAD_MESSAGE':
            return{
                ...state,
                channels: [...state.channels.map(c => new Channel(c.name, c.name == action.channel ? c.unread + 1 : c.unread))]
            }
        case 'READ_MESSAGES':
            return {
                ...state,
                channels: [...state.channels.map(c => new Channel(c.name, c.name == action.channel ? 0 : c.unread))]
            }
        default:
            return state;
    }
};
