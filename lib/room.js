
/**
* Information about a room returned from listRooms
*/
module.exports = class RoomInfo {
    constructor(id, roomType, onlineUsers, roomData) {
        /** The id of the room 
        * @type {string}
        */
        this.id = id;

        /** The type of the room (coresponding to the [RoomType(...)] attribute assignd to the room) 
        * @type {string}
        */
        this.roomType = roomType;

        /** How many users are currently in the room 
        * @type {number}
        */
        this.onlineUsers = onlineUsers;

        /** How many users are currently in the room 
        * @type {}
        */
        this.roomData = roomData;
    }
}