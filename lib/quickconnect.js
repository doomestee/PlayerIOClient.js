const HTTPChannel = require("./channel");
const Client = require("./client");
const util = require("./utilities");

/**
 * The lack of documentation for javascript is absolutely shocking, I cba figuring this out and other quickconnect methods so if you wanna make a pull request. please feel free.
 */

module.exports = {
    /**
	 * @param {string} gameId The game id of the game you wish to connect to. This value can be found in the admin panel.
	 * @param {string} usernameOrEmail The username, or email of the account to login via.
	 * @param {string} password The password of the account to use to login with.
	 * @param {object} playerInsightSegments Custom segments for the user in PlayerInsight.
	 */
	simpleConnect: (gameId, usernameOrEmail, password, playerInsightSegments) => {
        let channel = new HTTPChannel();

        return channel.simpleConnect(gameId, usernameOrEmail, password, util.convertToSegmentArray(playerInsightSegments), "javascript", util.convertToKVArray({}), null)
            .then(result => {
                channel.token = result.token;

                return new Client(channel, gameId, result.gamefsredirectmap, result.userid);
            })
	},

    /**
     * @param {string} gameId
     * @param {string} usernameOrEmail
     * @param {string} password
     * @param {string} email
     * @param {string} captchaKey
     * @param {string} captchaValue
     * @param {Object} extraData
     * @param {any} partnerId
     * @param {any} playerInsightSegments
     */
    simpleRegister: (gameId, usernameOrEmail, password, email, captchaKey, captchaValue, extraData, partnerId=null, playerInsightSegments=null) => {
        let channel = new HTTPChannel();

        return; //channel.simpleRegister(gameId, usernameOrEmail, password, email, captchaKey, captchaKey, util.convertToSegmentArray(playerInsightSegments))
    }
}