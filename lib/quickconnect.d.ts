import PlayerIOClient from "./client";

/**
 * 
 * @param gameId The game id of the game you wish to connect to. This value can be found in the admin panel.
 * @param usernameOrEmail The username, or email of the account to login via.
 * @param password The password of the account to use to login with.
 * @param playerInsightSegments Custom segments for the user in PlayerInsight.
 */
export function simpleConnect(gameId: string, usernameOrEmail: string, password: string, playerInsightSegments: Object): Promise<PlayerIOClient>;
//export function simpleRegister(gameId, usernameOrEmail, password, email, captchaKey, captchaValue, extraData, partnerId=null, playerInsightSegments=null): Promise<PlayerIOClient>;