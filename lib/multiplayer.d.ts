

/*const { convertToKVArray, convertFromKVArray } = require("./utilities.js");
const RoomInfo = require("./room.js");
const Connection = require("./connection.js");*/

import HTTPChannel from "./channel";
import Connection from "./connection";
import RoomInfo from "./room";

export = class Multiplayer {
    constructor(channel: HTTPChannel);

    /**
     * If not null, rooms will be created on the development server at the address defined by the server endpoint, instead of using the live multiplayer servers. 
     */
    developmentServer: string|null;

    protected channel: HTTPChannel;

    /**
     * Create a multiplayer room on the Player.IO infrastructure, returning the roomID.
     * @param roomId The id you wish to assign to your new room - You can use this to connect to the specific room later as long as it still exists.
     * @param roomType The name of the room type you wish to run the room as. This value should match one of the [RoomType(...)] attributes of your uploaded code. A room type of 'bounce' is always available.
     * @param visible Should the room be visible when listing rooms with GetRooms or not?
     * @param roomData The data to initialize the room with, this can be read with ListRooms and changed from the serverside.
     */
    createRoom(roomId: string, roomType: string, visible: boolean, roomData?: Object): Promise<string>;

    /**
     * Join a running multiplayer room.
     * @param roomId The id of the room you wish to connect to.
     * @param joinData Data to send to the room with additional information about the join.
     */
    joinRoom(roomId: string, joinData?: Object): Promise<Connection>;

    /**
     * Creates a multiplayer room (if it does not exist already) and joins it.
     * @param roomId The id of the room you wish to create/join.
     * @param roomType The name of the room type you wish to run the room as. This value should match one of the [RoomType(...)] attributes of your uploaded code. A room type of 'bounce' is always available.
     * @param visible If the room doesn't exist: Should the room be visible when listing rooms with GetRooms upon creation?
     * @param roomData If the room doesn't exist: The data to initialize the room with upon creation.
     * @param joinData Data to send to the room with additional information about the join.
     */
    createJoinRoom(roomId: string, roomType: string, visible: boolean, roomData?: Object, joinData?: Object): Promise<Connection>;

    /**
     * List the currently running multiplayer rooms.
     * @param roomType The type of room you wish to list.
     * @param searchCriteria Only rooms with the same values in their roomdata will be returned.
     * @param resultLimit The maximum amount of rooms you want to receive. Use 0 for 'as many as possible'.
     * @param resultOffset The offset into the list you wish to start listing at.
     */
    listRooms(roomType: string, searchCriteria: Object, resultLimit: number, resultOffset: number): Promise<RoomInfo[]>;
};