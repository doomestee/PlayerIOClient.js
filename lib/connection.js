// oh boy, let's do this!

const Message = require("./message");
const { serializeMessage, deserializeMessage } = require("./messageserializer");

const { WebSocket } = require("ws");
const PlayerIOError = require("./playerioerror");

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
         * Connection.messageCallback['*'] = [(msg) => { if (msg.type === "init") { conn.send("init"); } }]
         * @type {{[type: string]: (function(Message): void)[]}}
         */
        this.messageCallback = {};

        /**
         * TODO: use this... otherwise, user will have to rely on .socket.once disconnect thing
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
                    //if (this.socket.connected) {
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

                        console.log(msg._internal_("get-objects"));
                        this.sendMessage(msg);
                    //} else {
                    //}
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

        if (true) {//talkBinary || true) {
            let bytes = Uint8Array.from(serialized);//.length);
            for (let i = 0; i < serialized.length; i++) {
                bytes[i] = serialized[i];
            }
            this.socket.send(bytes.buffer)
        } else {
            let str = _pio.base64encode(serialized);
            socket.send(str);
        }
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

/*// simple bas64 round trip methods for arrays of bytes (0-255)
let codex = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
let inverseCodex = [];
for (let i = 0; i != codex.length; i++) {
    inverseCodex[codex.charCodeAt(i)] = i;
};
_pio.base64encode = function (bytes) {
    let output = [];

    for (let b = 0; b < bytes.length; b++) {
        // pick the 3 bytes
        let b1 = bytes[b];
        let b2 = ++b <= bytes.length ? bytes[b] : NaN;
        let b3 = ++b <= bytes.length ? bytes[b] : NaN;

        // encode them together
        let enc1 = b1 >> 2;
        let enc2 = ((b1 & 3) << 4) | (b2 >> 4);
        let enc3 = ((b2 & 15) << 2) | (b3 >> 6);
        let enc4 = b3 & 63;

        // overflow w. /
        if (isNaN(b2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(b3)) {
            enc4 = 64;
        }

        output.push(codex.charAt(enc1));
        output.push(codex.charAt(enc2));
        output.push(codex.charAt(enc3));
        output.push(codex.charAt(enc4));
    }

    return output.join("")
}

_pio.base64decode = function (string) {
    string = string.toString();
    let output = [];
    for (let c = 0; c < string.length; c++) {
        // pick the 4 characters representing 3 bytes
        let chr1 = inverseCodex[string.charCodeAt(c)];
        let chr2 = ++c < string.length ? inverseCodex[string.charCodeAt(c)] : 64;
        let chr3 = ++c < string.length ? inverseCodex[string.charCodeAt(c)] : 64;
        let chr4 = ++c < string.length ? inverseCodex[string.charCodeAt(c)] : 64;

        // encode them together
        let b1 = (chr1 << 2) | (chr2 >> 4);
        let b2 = ((chr2 & 15) << 4) | (chr3 >> 2);
        let b3 = ((chr3 & 3) << 6) | chr4;

        output.push(b1);
        if (chr3 != 64) {
            output.push(b2);
            if (chr4 != 64) {
                output.push(b3);
            }
        }
    }
    return output;
}*/