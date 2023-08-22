// Classes
const HTTPChannel = require("./channel");
const GameFS = require("./gamefs");
const PayVault = require("./payvault");
const BigDB = require("./bigdb");
const Multiplayer = require("./multiplayer");

// Misc
const util = require("./utilities");

/**
 * If you're creating a new one, use authenticate/quickconnect (via the class, not an instance of itself!)
 */
module.exports = class PlayerIOClient {
    /**
     * @param {HTTPChannel} channel
     * @param {string} gameId
     * @param {} gameFsRedirectMap 
     * @param {string} userId 
     */
    constructor(channel, gameId, gameFsRedirectMap, userId) {
		/**
		 * User id of the currently connected user.
		 * @type {string}
		 */
		this.connectUserId = userId;

		/**
		 * The game id of the client.
		 * @type {string}
		 */
		this.gameId = gameId;

		/**
		 * The GameFS service
		 * @type {GameFS}
		 */
		this.gameFS = new GameFS(gameId, gameFsRedirectMap);//gamefs(gameId, gameFsRedirectMap);

		/**
		 * The ErrorLog service
		 * @protected
		 */
		this.errorLog = {
            /**
            * Writes an entry to the error log
            * @param {string} error A short string describing the error without details. Example 'Object not set to instance of an object'
            * @param {string} details The message describing the error in detail. Example 'couldn't find the user 'bob' in the current game'
            * @param {string} stacktrace The stacktrace (if available) of the error
            * @param {object} extraData Any extra data you'd like to associate with the error log entry. Example: {score:200, level:'skyland'}
            */
            writeError(error, details, stacktrace, extradata){
                return channel.writeError("Javascript", error, details, stacktrace, util.convertToKVArray(extradata));
            }
        }

		/**
		 * The PayVault service
		 * @type {PayVault}
		 */
		this.payVault = new PayVault(channel);//this.payVault_pio.payVault(channel);

		/**
		 * The BigDB service
		 * @type {BigDB}
		 */
		this.bigDB = new BigDB(channel);//_pio.bigDB(channel);

		/**
		 * The Multiplayer service
		 * @type {Multiplayer}
		 */
		this.multiplayer = new Multiplayer(channel);

        return;


        
		// /**
		// * The GameRequests service
		// */
		// this.gameRequests = new _pio.gameRequests(channel);

		// /**
		// * The Achievements service
		// */
		// this.achievements = new _pio.achievements(channel);

		// /**
		// * The PlayerInsight service
		// */
		// this.playerInsight = new _pio.playerInsight(channel);

		// /**
		// * The OneScore service
		// */
		// this.oneScore = new _pio.oneScore(channel);

		// /**
		// * The Leaderboards service
	    // */
		// this.leaderboards = new _pio.leaderboards(channel, this.connectUserId);

		// /**
		// * The Notifications service
		// */
		// this.notifications = new _pio.notifications(channel);

		// /**
		// * The PlayerIO Publishing Network service
		// */
		// this.publishingNetwork = new _pio.publishingNetwork(channel, this.connectUserId);/**/
    }

    /**
	 * Authenticates a user to Player.IO. See the Authentication documentation on which authenticationArguments that are needed for each authentication provider.
	 * @param {string} gameId The game id of the game you wish to connect to. This value can be found in the admin panel.
	 * @param {string} connectionId The id of the connection, as given in the settings section of the admin panel. 'public' should be used as the default
	 * @param {object} authenticationArguments A dictionary of arguments for the given connection.
	 * @param {object} playerInsightSegments Custom segments for the user in PlayerInsight.
	 * @returns {Promise<PlayerIOClient>}
	 */
	static authenticate(gameId, connectionId, authenticationArguments, playerInsightSegments) {
        if (authenticationArguments.publishingnetworklogin === "auto") {
            /*
			if (typeof (window.PublishingNetwork) == 'undefined') {
				errorCallback(new PlayerIOError(PlayerIOErrorCode.GeneralError, "Could not find the PublishingNetwork object on the current page. Did you include the PublishingNetwork.js script?"));
				return
			}
			PublishingNetwork.dialog("login", { gameId: gameId, connectionId: connectionId, __use_usertoken__: true }, function (r) {
				if (r.error) {
					errorCallback(new PlayerIOError(PlayerIOErrorCode.GeneralError, r.error));
				} else if (typeof(r.userToken) == 'undefined') {
					errorCallback(new PlayerIOError(PlayerIOErrorCode.GeneralError, "Missing userToken value in result, but no error message given."));
				} else {
					PlayerIO.authenticate(gameId, connectionId, {userToken:r.userToken}, playerInsightSegments, successCallback, errorCallback)
				}
			})
			return
            */
        }

        let channel = new HTTPChannel();
        return channel.authenticate(gameId, connectionId, util.convertToKVArray(authenticationArguments), util.convertToSegmentArray(playerInsightSegments), "javascript", util.convertToKVArray({}), null)
            .then(result => {
                channel.token = result.token;
                return new this(channel, gameId, result.gamefsredirectmap, result.userid);
            });
	}
}