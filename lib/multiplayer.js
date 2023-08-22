const { convertToKVArray, convertFromKVArray } = require("./utilities");
const RoomInfo = require("./room");
const Connection = require("./connection");

module.exports = class Multiplayer {
    /**
     * @param {import("./channel")} channel
     */
    constructor(channel) {
        /** 
        * If not null, rooms will be created on the development server at the address defined by the server endpoint, instead of using the live multiplayer servers. 
        * @type string
        */
        this.developmentServer = null;

        this.channel = channel;
    }


    /**
    * Create a multiplayer room on the Player.IO infrastructure.
    * @param {string} roomId The id you wish to assign to your new room - You can use this to connect to the specific room later as long as it still exists.
    * @param {string} roomType The name of the room type you wish to run the room as. This value should match one of the [RoomType(...)] attributes of your uploaded code. A room type of 'bounce' is always available.
    * @param {bool} visible Should the room be visible when listing rooms with GetRooms or not?
    * @param {object} roomData The data to initialize the room with, this can be read with ListRooms and changed from the serverside.
    */
    createRoom(roomId, roomType, visible, roomData) {
        return this.channel.createRoom(roomId, roomType, visible, convertToKVArray(roomData), this.developmentServer != null)
            .then((result) => {return result.roomid; });
    }

    /**
    * Join a running multiplayer room.
    * @param {string} roomId The id of the room you wish to connect to.
    * @param {string} joinData Data to send to the room with additional information about the join.
    */
    joinRoom(roomId, joinData) {
        return this.channel.joinRoom(roomId, convertToKVArray(joinData), this.developmentServer != null, true)
            .then(result => {
                let conn = new Connection(this.developmentServer, result.endpoints, result.joinkey, joinData || {});

                return conn.connect();
            })
    }

    /**
    * Creates a multiplayer room (if it does not exist already) and joins it.
    * @param {string} roomId The id of the room you wish to create/join.
    * @param {string} roomType The name of the room type you wish to run the room as. This value should match one of the [RoomType(...)] attributes of your uploaded code. A room type of 'bounce' is always available.
    * @param {bool} visible If the room doesn't exist: Should the room be visible when listing rooms with GetRooms upon creation?
    * @param {object} roomData If the room doesn't exist: The data to initialize the room with upon creation.
    * @param {object} joinData Data to send to the room with additional information about the join.
    * @returns {Promise<Connection|Error>}
    */
    createJoinRoom(roomId, roomType, visible, roomData, joinData) {
        return this.channel.createJoinRoom(roomId, roomType, visible, convertToKVArray(roomData), convertToKVArray(joinData), this.developmentServer != null, true)
            .then(result => {
                let conn = new Connection(this.developmentServer, result.endpoints, result.joinkey, joinData || {});

                return conn.connect();
            });
    }

    /**
    * List the currently running multiplayer rooms.
    * @param {string} roomType The type of room you wish to list.
    * @param {object} searchCriteria Only rooms with the same values in their roomdata will be returned.
    * @param {int} resultLimit The maximum amount of rooms you want to receive. Use 0 for 'as many as possible'.
    * @param {int} resultOffset The offset into the list you wish to start listing at.
    */
    listRooms(roomType, searchCriteria, resultLimit, resultOffset) {
        return this.channel.listRooms(roomType, convertToKVArray(searchCriteria), resultLimit, resultOffset, this.developmentServer != null)
            .then(result => {
                let arr = [];

                if (result.rooms?.length > 0) {
                    for (let i = 0; i < result.rooms.length; i++) {
                        let item = result.rooms[i];

                        arr.push(new RoomInfo(item.id, item.roomtype, item.onlineusers, convertFromKVArray(item.roomdata)));
                    }
                }; return arr;
            })
    }
}