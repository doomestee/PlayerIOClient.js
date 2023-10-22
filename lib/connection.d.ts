import { WebSocket, CloseEvent } from "ws";
import Message from "./message";
import { HttpsProxyAgentOptions } from "https-proxy-agent";

export = class Connection {
    constructor(developmentServer: unknown, endpoints: { address: string, port: number }[], joinKey: string, joinData: Object, proxyUse?: HttpsProxyAgentOptions);

    /**
     * An object mapped by message types leading to an array of callbacks that takes in the message for first parameter. If undefined, no callbacks for it exists.
     * @example
     * connection.messageCallback['*'] = [(msg) => { if (msg.type === "init") { conn.send("init"); } }]
     */
    messageCallback: {
        [type: string]: (function(Message): void)[]
    };

    disconnectCallback: (function(CloseEvent): void)[];

    socket: WebSocket;

    protected waitingForJoinResult: boolean;
    
    protected endpoints: { address: string, port: number }[];

    protected joinKey: string;

    protected joinData: string;

    protected developmentServer: string;

    protected proxyObj: (HttpsProxyAgentOptions<string> & { uri: string })?;

    connected: boolean;

    protected connectTimeout: number;

    protected endpointStrings: string[];

    protected connect(): Promise<Connection>;

    /**
     * Disconnect from the multiplayer room
     */
    disconnect(): void;

    protected socketOnError(): void;

    sendMessage(message: Message): void;

    /**
     * Create a message with arguments inline: connection.createMessage('invite', arg1, arg2...)
     * @param {string} type The string type to give to the message.
     */
    createMessage(type: string, ...args): Message;

    /**
     * Send a message with arguments inline: connection.createMessage('invite', arg1, arg2...)
     * @param {string} type The string type to give to the message.
     */
    send(type: string, ...args): void;

    /**
     * @param type Use "*" for all message types.
     * @param msg
     */
    executeCallbacks(type: string, msg: Message): void;

    /**
     * Add a message callback for the given message type.
     * @param type The type of message to invoke the callback for. Use '*' or null to handle all message types.
     * @param callback The callback to be called when a message of the given type is received.
     */
    addMessageCallback(type: string, callback: function(Message): void): void;

    /**
     * Add a callback that triggers when the connection closes.
     * 
     * The CloseEvent will always have the code property, reason is provided but may be empty string.
     * @param callback The callback to be called when the connection disconnects, for any reason.
     */
    addDisconnectCallback(callback: function(CloseEvent): void): void;
}