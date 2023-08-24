// oh boy, let's do this!

const Message = require("./message.js");
const { serializeMessage, deserializeMessage } = require("./messageserializer.js");

const { WebSocket } = require("ws");
const PlayerIOError = require("./playerioerror.js");

module.exports = class Connection {
    /**
     * @param {null} developmentServer
     * @param {{port: number, address: string}[]} endpoints
     * @param {string} joinKey
     * @param {Object} joinData
     */
    constructor(developmentServer, endpoints, joinKey, joinData, connectTimeout=10000) {
        /**
         * An object mapped by message types leading to an array of callbacks that takes in the message for first parameter. If undefined, no callbacks for it exists.
         * @example
         * connection.messageCallback['*'] = [(msg) => { if (msg.type === "init") { conn.send("init"); } }]
         * @type {{[type: string]: (function(Message): void)[]}}
         */
        this.messageCallback = {};

        /**
         * TODO: make use of this... otherwise, user will have to rely on .socket.once disconnect thing
         */
        this.disconnectCallback = [];

        /**
         * @protected
         */
        this.queuedMessages = [];

        this.socket  = null;

        /**
         * @protected
         */
        this.waitingForJoinResult = true;

        /**
         * @protected
         */
        this.endpoints = endpoints;

        /**
         * @protected
         */
        this.joinKey = joinKey;

        /**
         * @protected
         */
        this.joinData = joinData;

        /**
         * @protected
         */
        this.developmentServer = developmentServer;

        this.connected = false;

        //this.url = (endpoint) => { return "wss://" + endpoint + "/"; }

        /**
         * @type {WebSocket}
         */
        this.socket = null;

        /**
         * @protected
         */
        this.connectTimeout = connectTimeout;

        /**
         * @type {string[]}
         * @protected
         */
        this.endpointStrings;

        if (developmentServer) this.endpointStrings = [this.developmentServer];
        else {
            this.endpointStrings = [];
            for (let i = 0; i < this.endpoints.length; i++) {
                if ([80].some(v => v === this.endpoints[i].port)) continue;

                this.endpointStrings.push(this.endpoints[i].address + ":" + this.endpoints[i].port);
            }
        }
    }

    /**
     * @protected
     */
    connect() {
        return new Promise((res, rej) => {
            if (this.connected) throw Error("Socket's already connected, disconnect first.");

            let index = 0;

            let tryNextEndpoint = () => {
                if (this.endpointStrings.length < 1) return rej("Could not establish a socket connection to any of the given endpoints for the room");

                let chosen = index;

                // grab the first endpoint off the list
                let endpoint = this.endpointStrings.splice(0, 1)[0];

                // attempt to create a socket connection
                this.socket = new WebSocket("wss://" + endpoint + "/", { timeout: 4000 });

                this.socket.on("message", (data, isBinary) => {
                    if (!this.connected) return;

                    let msg = deserializeMessage(data, 0, data.length);

                    if (this.waitingForJoinResult) {
                        if (msg.type === "playerio.joinresult") {
                            this.waitingForJoinResult = false;

                            if (!msg.getBoolean(0)) {
                                rej([msg.getInt(1), msg.getString(2)]);
                            } else res(this);
                        } else rej(new PlayerIOError(PlayerIOError.PlayerIOErrorCode.GeneralError, "The expected inital messagetype is: playerio.joinresult, received: " + joinResult.getType()));
                    } else {
                        this.executeCallbacks(msg.type, msg);
                        this.executeCallbacks('*', msg);
                    }
                });
                this.socket.once("close", (code, reason) => {
                    if (index === chosen) {
                        // DEBUGLOG
                        console.log("Disconnected, reason: " + reason);

                        if (this.connected) { this.connected = false; }
                    }
                });
                this.socket.once("open", () => {
                    clearTimeout(this.timeout);
                    this.connected = true;

                    // send join data
                    let msg = this.createMessage("join");
                    msg.addString(this.joinKey);

                    if (this.joinData != null) {
                        for (let x in this.joinData) {
                            msg.addString(x);
                            msg.addString("" + this.joinData[x]);
                        }
                    }

                    this.sendMessage(msg);
                });
                this.socket.once("error", this.socketOnError);

                this.timeout = setTimeout(() => {
                    if (this.connected) return;

                    // DEBUGLOG
                    console.log("Unable to connect to endpoint: " + endpoint + ". reason: \"" + "idk" + (this.endpointStrings.length > 0 ? "\". Trying next endpoint." : "\". No more endpoints to try."));
                    index++;
                    tryNextEndpoint();
                }, 4000);
            }

            tryNextEndpoint();
        })
    }

    /**
     * Disconnect from the multiplayer room
     */
    disconnect() {
        if (this.connected) {
            this.connected = false;
            //onDisconnect();
            try {
                this.socket.close();
            } catch (e) { console.log(e); }
        }
    }

    /**
     * @protected
     */
    socketOnError(msg) {
        console.error(msg);
        this.disconnect();
    }

    /**
     * @protected
     */
    sendMessage(message) {
        let serialized = serializeMessage(message);

        let bytes = Uint8Array.from(serialized);
        for (let i = 0; i < serialized.length; i++) {
            bytes[i] = serialized[i];
        }; this.socket.send(bytes.buffer)
    }

    /**
     * Create a message with arguments inline: connection.createMessage('invite', arg1, arg2...)
     * @param {string} type
     * @param args NOTE THIS PROPERTY ISN'T MEANT TO BE GIVEN AS AN ARRAY, just spread it across many arguments.
     * @returns {Message} The message
     */
    createMessage(type, ...args) {
        let msg = new Message(type);

        for (let i = 0; i < args.length; i++) {
            msg.add(args[i]);
        } return msg;
    }

    /**
     * Send a message with arguments inline: connection.createMessage('invite', arg1, arg2...)
     * @param {string} type The string type to give to the message.
     */
    send(type, ...args) {
        this.sendMessage(this.createMessage(type, ...args));
    }

    /**
     * @param {string} type Use * for all message types.
     * @param {Message} msg
     * @protected
     */
    executeCallbacks(type, msg) {
        let arr = this.messageCallback[type];
        if (arr && arr.length) {
            for (let i = 0; i < arr.length; i++) {
                arr[i](msg);
            }
        }
    }

    /**
    * Add a message callback for the given message type.
    * @param {string} type The type of message to invoke the callback for. Use '*' or null to handle all message types.
    * @param {function(Message)} callback The callback to be called when a message of the given type is received
    * 
    * An example usage:
    * @example connection.addMessageCallback("*", (message) => {
    *      if (message.type === "init") message.send("init2");
    * });
    */
    addMessageCallback(type, callback) {
        if (type == null) type = "*"
        let list = this.messageCallback[type]
        if (!list) {
            this.messageCallback[type] = list = [];
        }
        list.push(callback);
    }
}