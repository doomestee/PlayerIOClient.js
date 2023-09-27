import Achievements from "./achievements";
import BigDB from "./bigdb";
import HTTPChannel from "./channel";
import GameFS from "./gamefs";
import Multiplayer from "./multiplayer";
import PayVault from "./payvault";

/**
 * If you're creating a new one, use static authenticate or quickconnect!
 */
export = class PlayerIOClient {
    constructor(channel: HTTPChannel, gameId: string, gameFsRedirectMap: {}, userId: string);

    /**
     * User id of the currently connected user.
     */
    connectUserId: string;

    /**
     * The game id of the client.
     */
    gameId: string;

    /**
     * An instance of GameFS.
     */
    gameFS: GameFS;

    errorLog = {
        /**
         * Writes an entry to the error log
         * @param error A short string describing the error without details. Example 'Object not set to instance of an object'.
         * @param details The message describing the error in detail. Example 'couldn't find the user 'bob' in the current game'.
         * @param stacktrace The stacktrace (if available) of the error.
         * @param extraData Any extra data you'd like to associate with the error log entry. Example: {score:200, level:'skyland'}.
         */
        writeError(error: string, details: string, stacktrace: string, extraData: Object): Promise<unknown>;
    };

    /**
     * An instance of PayVault.
     */
    payVault: PayVault;

    /**
     * An instance of BigDB.
     */
    bigDB: BigDB;

    /**
     * An instance of Multiplayer.
     */
    multiplayer: Multiplayer;

    /**
     * An instance of Achievements.
     */
    achievements: Achievements;

    /**
     * Authenticates a user to Player.IO. See the Authentication documentation on which authenticationArguments that are needed for each authentication provider.
     * @param gameId The game id of the game you wish to connect to. This value can be found in the admin panel.
     * @param connectionId The id of the connection, as given in the settings section of the admin panel. 'public' should be used as the default.
     * @param authenticationArguments A dictionary of arguments for the given connection.
     * @param playerInsightSegments Custom segments for the user in PlayerInsight.
     */
    static authenticate(gameId: string, connectionId: string, authenticationArguments: Object, playerInsightSegments: Object): Promise<PlayerIOClient>;
}