/**
 * Information about a room returned from listRooms
 */
export = class RoomInfo {
    constructor(id: string, roomType: string, onlineUsers: number, roomData: unknown);

    /**
     * The id of the room.
     */
    id: string;

    /**
     * The type of the room (coresponding to the [RoomType(...)] attribute assignd to the room).
     */
    roomType: string;

    /**
     * How many users are currently in the room.
     */
    onlineUsers: number;

    /**
     * How many users are currently in the room.
     */
    roomData: unknown;
};