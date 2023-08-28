import { KVArray, LockType } from "./utilities";

export interface CallResult {
    token: string;
}

export = class HTTPChannel {
    constructor(token: string);

    /**
     * Authorization token, taken from successful authentication.
     */
    token: string;

    async call(method: number, args: Object);

    //#region Authentication
    /**
     * Unknown types for clientInfo; please make an issue request if you know (after having successfully done it)
     */
    connect(gameId: string, connectionId: string, userId: string, auth, partnerId: string, playerInsightSegments: Object, clientAPI: string, clientInfo): Promise<CallResult>;
    /**
     * Unknown types for clientInfo, playCodes; please make an issue request if you know (after having successfully done it)
     */
    authenticate(gameId: string, connectionId: string, authenticationArguments: Object, playerInsightSegments: Object, clientAPI: string, clientInfo, playCodes): Promise<CallResult>
    //#endregion
    //#region Connection
    createRoom(roomId: string, roomType: string, visible: boolean, roomData: Object, isDevRoom: boolean): Promise<CallResult>
    joinRoom(roomId: string, joinData, isDevRoom: boolean, serverDomainNameNeeded: boolean): Promise<CallResult>
    createJoinRoom(roomId: string, roomType: string, visible: boolean, roomData: Object, joinData, isDevRoom: boolean, serverDomainNameNeeded: boolean): Promise<CallResult>
    listRooms(roomType: string, searchCriteria: Object, resultLimit: number, resultOffset: number, onlyDevRooms: boolean): Promise<CallResult>
    userLeftRoom(extendedroomId: string, newPlayerCount: number, closed: boolean): Promise<CallResult>
    updateRoom(extendedroomId: string, visible: boolean, roomData: Object): Promise<CallResult>
    //#endregion
    writeError(source: "Javascript", error: string, details: string, stacktrace: string, extraData: Object): Promise<CallResult>
    //#region BigDB
    createObjects(objects: { key: string, table: string, properties: ({ name: string }|{ index: number})[]}[], loadExisting: boolean): Promise<CallResult>
    loadObjects(objectIds: {table: string, keys: string[]}[]): Promise<CallResult>
    saveObjectChanges(lockType: LockType, changesets: { key: string, table: string, fulloverwrite: boolean, onlyifversion: unknown, changes: unknown}[], createIfMissing: boolean): Promise<CallResult>
    deleteObjects(objectIds: {table: string, keys: string[]}[]): Promise<CallResult>
    loadMatchingObjects(table: string, index: string, indexValue: unknown, limit: number): Promise<CallResult>
    loadIndexRange(table: string, index: string, startIndexValue: unknown, stopIndexValue: unknown, limit: number): Promise<CallResult>
    deleteIndexRange(table: string, index: string, startIndexValue: unknown, stopIndexValue: unknown): Promise<CallResult>
    loadMyPlayerObject(): Promise<CallResult>
    //#endregion
    //#region PayVault (cri)
    payVaultReadHistory(page: number, pageSize: number, targetUserId: unknown): Promise<CallResult>
    payVaultRefresh(lastVersion: number, targetUserId: unknown): Promise<CallResult>
    payVaultConsume(ids: string[], targetUserId: unknown): Promise<CallResult>
    payVaultCredit(amount: number, reason: string, targetUserId: unknown): Promise<CallResult>
    payVaultDebit(amount: number, reason: string, targetUserId: unknown): Promise<CallResult>
    payVaultBuy(items: { itemkey: unknown, payload: { name: string }|{ index: number } }[], storeItems: boolean, targetUserId: unknown): Promise<CallResult>
    payVaultGive(items: { itemkey: unknown, payload: { name: string }|{ index: number } }[], targetUserId: unknown): Promise<CallResult>
    payVaultPaymentInfo(provider: string, purchaseArguments: KVArray[], items: unknown): Promise<CallResult>
    payVaultUsePaymentInfo(provider: string, providerArguments: unknown): Promise<CallResult>
    partnerPayTrigger(key: unknown, count: unknown): Promise<CallResult>
    partnerPaySetTag(partnerId: unknown): Promise<CallResult>
    //#endregion
    //#region Notifications
    notificationsRefresh(lastVersion): Promise<CallResult>
    notificationsRegisterEndpoints(lastVersion, endpoints): Promise<CallResult>
    notificationsSend(notifications): Promise<CallResult>
    notificationsToggleEndpoints(lastVersion, endpoints, enabled): Promise<CallResult>
    notificationsDeleteEndpoints(lastVersion, endpoints): Promise<CallResult>
    //#endregion
    //#region Game Requests
    gameRequestsSend(requestType, requestData, requestRecipients): Promise<CallResult>
    gameRequestsRefresh(playCodes): Promise<CallResult>
    gameRequestsDelete(requestIds): Promise<CallResult>
    //#endregion
    //#region Achievements
    achievementsRefresh(lastVersion): Promise<CallResult>
    achievementsLoad(userIds): Promise<CallResult>
    achievementsProgressSet(achievementId, progress): Promise<CallResult>
    achievementsProgressAdd(achievementId, progressDelta): Promise<CallResult>
    achievementsProgressMax(achievementId, progress): Promise<CallResult>
    achievementsProgressComplete(achievementId): Promise<CallResult>
    //#endregion
    //#region Player Insight
    playerInsightRefresh(): Promise<CallResult>
    playerInsightSetSegments(segments): Promise<CallResult>
    playerInsightTrackInvitedBy(invitingUserId, invitationChannel): Promise<CallResult>
    playerInsightTrackEvents(events): Promise<CallResult>
    playerInsightTrackExternalPayment(currency, amount): Promise<CallResult>
    playerInsightSessionKeepAlive(): Promise<CallResult>
    playerInsightSessionStop(): Promise<CallResult>
    //#endregion
    //#region OneScore
    oneScoreLoad(userIds): Promise<CallResult>
    oneScoreSet(score): Promise<CallResult>
    oneScoreAdd(score): Promise<CallResult>
    oneScoreRefresh(): Promise<CallResult>
    //#endregion
    //#region QuickConnect/thing
    simpleConnect(gameId: string, usernameOrEmail: string, password: string, playerInsightSegments: Object, clientAPI: string, clientInfo): Promise<CallResult>
    simpleRegister(gameId: string, username: string, password: string, email: string, captchaKey: string, captchaValue: string, extraData, partnerId, playerInsightSegments: Object, clientAPI: string, clientInfo): Promise<CallResult>
    simpleRecoverPassword(gameId: string, usernameOrEmail: string): Promise<CallResult>
    kongregateConnect(gameId: string, userId, gameAuthToken, playerInsightSegments: Object, clientAPI: string, clientInfo): Promise<CallResult>
    simpleGetCaptcha(gameId: string, width, height): Promise<CallResult>
    facebookOAuthConnect(gameId: string, accessToken, partnerId, playerInsightSegments: Object, clientAPI: string, clientInfo): Promise<CallResult>
    steamConnect(gameId: string, steamAppId, steamSessionTicket, playerInsightSegments: Object, clientAPI: string, clientInfo): Promise<CallResult>
    simpleUserGetSecureLoginInfo(): Promise<CallResult>
    //#region 
    //#region Leaderboard
    leaderboardsGet(group, leaderboard, index, count, neighbourUserId, filterUserIds): Promise<CallResult>
    leaderboardsSet(group, leaderboard, score): Promise<CallResult>
    leaderboardsCount(group, leaderboard): Promise<CallResult>
    //#endregion
    //#region I don't know what the fuck are those
    joinCluster(clusterAccessKey, isDevelopmentServer, ports, machineName, version, machineId, os, cpu, cpuCores, cpuLogicalCores, cpuAddressWidth, cpuMaxClockSpeed, ramMegabytes, ramSpeed): Promise<CallResult>
    serverHeartbeat(serverId, appDomains, serverTypes, machineCPU, processCPU, memoryUsage, avaliableMemory, freeMemory, runningRooms, usedResources, aPIRequests, aPIRequestsError, aPIRequestsFailed, aPIRequestsExecuting, aPIRequestsQueued, aPIRequestsTime, serverUnixTimeUtc): Promise<CallResult>
    getGameAssemblyUrl(clusterAccessKey, gameCodeId, machineId): Promise<CallResult>
    devServerLogin(username, password): Promise<CallResult>
    webserviceOnlineTest(): Promise<CallResult>
    getServerInfo(machineId): Promise<CallResult>
    socialRefresh(): Promise<CallResult>
    socialLoadProfiles(userIds): Promise<CallResult>
    //#endregion
}