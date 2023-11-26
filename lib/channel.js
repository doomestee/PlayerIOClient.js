const { request, ProxyAgent } = require("undici");

/**
 * This is based on PIO's implementation of their own channel, it's essentially a wrapper for HTTP requests.
 */
module.exports = class HTTPChannel {
    constructor(token) {
        /**
         * Authorization token. (Note if this isn't passed, simply using a connect method will supplement this)
         */
        this.token = token;

        /**
         * Proxy Agent (an instance of undici's ProxyAgent).
         */
        this.proxyAgent = null;
    }

    /**
     * 
     * @param {number} method NOT TO BE CONFUSED WITH THINGS LIKE "get", "post" et This is essentially the type of request you're sending, for eg 10 is connect
     * @param {*} args 
     */
    async call(method, args) {
        // I know I could do chaining etc, but this is for the consistency ig.
        const result = await request("https://api.playerio.com/json/", {
            method: "POST",
            body: "[" + method + "|" + (this.token || "") + "]" + JSON.stringify(args),
            dispatcher: this.proxyAgent ? this.proxyAgent : undefined
        });

        let text = await result.body.text();

        if (text[0] === "[") {
            let end = text.indexOf("]");
            this.token = text.substring(1, end);
            text = text.substring(end + 1);
        }

        // bandage fix for bigdb load where pio will throw a NaN.
        text = text.replace(/:NaN/g, ":null");
        return text = JSON.parse(text);
    }

    /**
     * BEWARE, you're about to see the absolute mess, they've been modified so they'll always return the result, as no longer needs the callback.
     */
    connect(gameId, connectionId, userId, auth, partnerId, playerInsightSegments, clientAPI, clientInfo) {
        return this.call(10, {gameid:gameId, connectionid:connectionId, userid:userId, auth:auth, partnerid:partnerId, playerinsightsegments:playerInsightSegments, clientapi:clientAPI, clientinfo:clientInfo})
    }
    authenticate(gameId, connectionId, authenticationArguments, playerInsightSegments, clientAPI, clientInfo, playCodes){ return this.call(13, {gameid:gameId, connectionid:connectionId, authenticationarguments:authenticationArguments, playerinsightsegments:playerInsightSegments, clientapi:clientAPI, clientinfo:clientInfo, playcodes:playCodes})}
    createRoom(roomId, roomType, visible, roomData, isDevRoom){ return this.call(21, {roomid:roomId, roomtype:roomType, visible:visible, roomdata:roomData, isdevroom:isDevRoom})}
    joinRoom(roomId, joinData, isDevRoom, serverDomainNameNeeded){ return this.call(24, {roomid:roomId, joindata:joinData, isdevroom:isDevRoom, serverdomainnameneeded:serverDomainNameNeeded})}
    createJoinRoom(roomId, roomType, visible, roomData, joinData, isDevRoom, serverDomainNameNeeded){ return this.call(27, {roomid:roomId, roomtype:roomType, visible:visible, roomdata:roomData, joindata:joinData, isdevroom:isDevRoom, serverdomainnameneeded:serverDomainNameNeeded})}
    listRooms(roomType, searchCriteria, resultLimit, resultOffset, onlyDevRooms){ return this.call(30, {roomtype:roomType, searchcriteria:searchCriteria, resultlimit:resultLimit, resultoffset:resultOffset, onlydevrooms:onlyDevRooms})}
    userLeftRoom(extendedRoomId, newPlayerCount, closed){ return this.call(40, {extendedroomid:extendedRoomId, newplayercount:newPlayerCount, closed:closed})}
    writeError(source, error, details, stacktrace, extraData){ return this.call(50, {source:source, error:error, details:details, stacktrace:stacktrace, extradata:extraData})}
    updateRoom(extendedRoomId, visible, roomData){ return this.call(53, {extendedroomid:extendedRoomId, visible:visible, roomdata:roomData})}
    //
    createObjects(objects, loadExisting){ return this.call(82, {objects:objects, loadexisting:loadExisting})}
    loadObjects(objectIds){ return this.call(85, {objectids:objectIds})}
    //_pio.LockType = {NoLocks:0,LockIndividual:1,LockAll:2}
    saveObjectChanges(lockType, changesets, createIfMissing){ return this.call(88, {locktype:lockType, changesets:changesets, createifmissing:createIfMissing})}
    deleteObjects(objectIds){ return this.call(91, {objectids:objectIds})}
    loadMatchingObjects(table, index, indexValue, limit){ return this.call(94, {table:table, index:index, indexvalue:indexValue, limit:limit})}
    loadIndexRange(table, index, startIndexValue, stopIndexValue, limit){ return this.call(97, {table:table, index:index, startindexvalue:startIndexValue, stopindexvalue:stopIndexValue, limit:limit})}
    deleteIndexRange(table, index, startIndexValue, stopIndexValue){ return this.call(100, {table:table, index:index, startindexvalue:startIndexValue, stopindexvalue:stopIndexValue})}
    loadMyPlayerObject(){ return this.call(103, {})}
    payVaultReadHistory(page, pageSize, targetUserId){ return this.call(160, {page:page, pagesize:pageSize, targetuserid:targetUserId})}
    payVaultRefresh(lastVersion, targetUserId){ return this.call(163, {lastversion:lastVersion, targetuserid:targetUserId})}
    payVaultConsume(ids, targetUserId){ return this.call(166, {ids:ids, targetuserid:targetUserId})}
    payVaultCredit(amount, reason, targetUserId){ return this.call(169, {amount:amount, reason:reason, targetuserid:targetUserId})}
    payVaultDebit(amount, reason, targetUserId){ return this.call(172, {amount:amount, reason:reason, targetuserid:targetUserId})}
    payVaultBuy(items, storeItems, targetUserId){ return this.call(175, {items:items, storeitems:storeItems, targetuserid:targetUserId})}
    payVaultGive(items, targetUserId){ return this.call(178, {items:items, targetuserid:targetUserId})}
    payVaultPaymentInfo(provider, purchaseArguments, items){ return this.call(181, {provider:provider, purchasearguments:purchaseArguments, items:items})}
    payVaultUsePaymentInfo(provider, providerArguments){ return this.call(184, {provider:provider, providerarguments:providerArguments})}
    partnerPayTrigger(key, count){ return this.call(200, {key:key, count:count})}
    partnerPaySetTag(partnerId){ return this.call(203, {partnerid:partnerId})}
    notificationsRefresh(lastVersion){ return this.call(213, {lastversion:lastVersion})}
    notificationsRegisterEndpoints(lastVersion, endpoints){ return this.call(216, {lastversion:lastVersion, endpoints:endpoints})}
    notificationsSend(notifications){ return this.call(219, {notifications:notifications})}
    notificationsToggleEndpoints(lastVersion, endpoints, enabled){ return this.call(222, {lastversion:lastVersion, endpoints:endpoints, enabled:enabled})}
    notificationsDeleteEndpoints(lastVersion, endpoints){ return this.call(225, {lastversion:lastVersion, endpoints:endpoints})}
    gameRequestsSend(requestType, requestData, requestRecipients){ return this.call(241, {requesttype:requestType, requestdata:requestData, requestrecipients:requestRecipients})}
    gameRequestsRefresh(playCodes){ return this.call(244, {playcodes:playCodes})}
    gameRequestsDelete(requestIds){ return this.call(247, {requestids:requestIds})}
    achievementsRefresh(lastVersion){ return this.call(271, {lastversion:lastVersion})}
    achievementsLoad(userIds){ return this.call(274, {userids:userIds})}
    achievementsProgressSet(achievementId, progress){ return this.call(277, {achievementid:achievementId, progress:progress})}
    achievementsProgressAdd(achievementId, progressDelta){ return this.call(280, {achievementid:achievementId, progressdelta:progressDelta})}
    achievementsProgressMax(achievementId, progress){ return this.call(283, {achievementid:achievementId, progress:progress})}
    achievementsProgressComplete(achievementId){ return this.call(286, {achievementid:achievementId})}
    playerInsightRefresh(){ return this.call(301, {})}
    playerInsightSetSegments(segments){ return this.call(304, {segments:segments})}
    playerInsightTrackInvitedBy(invitingUserId, invitationChannel){ return this.call(307, {invitinguserid:invitingUserId, invitationchannel:invitationChannel})}
    playerInsightTrackEvents(events){ return this.call(311, {events:events})}
    playerInsightTrackExternalPayment(currency, amount){ return this.call(314, {currency:currency, amount:amount})}
    playerInsightSessionKeepAlive(){ return this.call(317, {})}
    playerInsightSessionStop(){ return this.call(320, {})}
    oneScoreLoad(userIds){ return this.call(351, {userids:userIds})}
    oneScoreSet(score){ return this.call(354, {score:score})}
    oneScoreAdd(score){ return this.call(357, {score:score})}
    oneScoreRefresh(){ return this.call(360, {})}
    simpleConnect(gameId, usernameOrEmail, password, playerInsightSegments, clientAPI, clientInfo){ return this.call(400, {gameid:gameId, usernameoremail:usernameOrEmail, password:password, playerinsightsegments:playerInsightSegments, clientapi:clientAPI, clientinfo:clientInfo})}
    simpleRegister(gameId, username, password, email, captchaKey, captchaValue, extraData, partnerId, playerInsightSegments, clientAPI, clientInfo){ return this.call(403, {gameid:gameId, username:username, password:password, email:email, captchakey:captchaKey, captchavalue:captchaValue, extradata:extraData, partnerid:partnerId, playerinsightsegments:playerInsightSegments, clientapi:clientAPI, clientinfo:clientInfo})}
    simpleRecoverPassword(gameId, usernameOrEmail){ return this.call(406, {gameid:gameId, usernameoremail:usernameOrEmail})}
    kongregateConnect(gameId, userId, gameAuthToken, playerInsightSegments, clientAPI, clientInfo){ return this.call(412, {gameid:gameId, userid:userId, gameauthtoken:gameAuthToken, playerinsightsegments:playerInsightSegments, clientapi:clientAPI, clientinfo:clientInfo})}
    simpleGetCaptcha(gameId, width, height){ return this.call(415, {gameid:gameId, width:width, height:height})}
    facebookOAuthConnect(gameId, accessToken, partnerId, playerInsightSegments, clientAPI, clientInfo){ return this.call(418, {gameid:gameId, accesstoken:accessToken, partnerid:partnerId, playerinsightsegments:playerInsightSegments, clientapi:clientAPI, clientinfo:clientInfo})}
    steamConnect(gameId, steamAppId, steamSessionTicket, playerInsightSegments, clientAPI, clientInfo){ return this.call(421, {gameid:gameId, steamappid:steamAppId, steamsessionticket:steamSessionTicket, playerinsightsegments:playerInsightSegments, clientapi:clientAPI, clientinfo:clientInfo})}
    simpleUserGetSecureLoginInfo(){ return this.call(424, {})}
    leaderboardsGet(group, leaderboard, index, count, neighbourUserId, filterUserIds){ return this.call(431, {group:group, leaderboard:leaderboard, index:index, count:count, neighbouruserid:neighbourUserId, filteruserids:filterUserIds})}
    leaderboardsSet(group, leaderboard, score){ return this.call(434, {group:group, leaderboard:leaderboard, score:score})}
    leaderboardsCount(group, leaderboard){ return this.call(437, {group:group, leaderboard:leaderboard})}
    joinCluster(clusterAccessKey, isDevelopmentServer, ports, machineName, version, machineId, os, cpu, cpuCores, cpuLogicalCores, cpuAddressWidth, cpuMaxClockSpeed, ramMegabytes, ramSpeed){ return this.call(504, {clusteraccesskey:clusterAccessKey, isdevelopmentserver:isDevelopmentServer, ports:ports, machinename:machineName, version:version, machineid:machineId, os:os, cpu:cpu, cpucores:cpuCores, cpulogicalcores:cpuLogicalCores, cpuaddresswidth:cpuAddressWidth, cpumaxclockspeed:cpuMaxClockSpeed, rammegabytes:ramMegabytes, ramspeed:ramSpeed})}
    serverHeartbeat(serverId, appDomains, serverTypes, machineCPU, processCPU, memoryUsage, avaliableMemory, freeMemory, runningRooms, usedResources, aPIRequests, aPIRequestsError, aPIRequestsFailed, aPIRequestsExecuting, aPIRequestsQueued, aPIRequestsTime, serverUnixTimeUtc){ return this.call(510, {serverid:serverId, appdomains:appDomains, servertypes:serverTypes, machinecpu:machineCPU, processcpu:processCPU, memoryusage:memoryUsage, avaliablememory:avaliableMemory, freememory:freeMemory, runningrooms:runningRooms, usedresources:usedResources, apirequests:aPIRequests, apirequestserror:aPIRequestsError, apirequestsfailed:aPIRequestsFailed, apirequestsexecuting:aPIRequestsExecuting, apirequestsqueued:aPIRequestsQueued, apirequeststime:aPIRequestsTime, serverunixtimeutc:serverUnixTimeUtc})}
    getGameAssemblyUrl(clusterAccessKey, gameCodeId, machineId){ return this.call(513, {clusteraccesskey:clusterAccessKey, gamecodeid:gameCodeId, machineid:machineId})}
    devServerLogin(username, password){ return this.call(524, {username:username, password:password})}
    webserviceOnlineTest(){ return this.call(533, {})}
    getServerInfo(machineId){ return this.call(540, {machineid:machineId})}
    socialRefresh(){ return this.call(601, {})}
    socialLoadProfiles(userIds){ return this.call(604, {userids:userIds})}
}