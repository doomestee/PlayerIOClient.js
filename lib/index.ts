'use strict';

export { default as PlayerIOClient } from "./client";
export { default as Message } from "./message";
export { default as HTTPChannel } from "./channel";
export { default as Connection } from "./connection";
export { default as QuickConnect } from "./quickconnect";
export * as Constants from "./constants";

export { default as PlayerIOError } from "./error";

// services
import { default as Achievements } from "./services/achievements";
import { default as BigDB } from "./services/bigdb";
import { default as GameFS } from "./services/gamefs";
import { default as Multiplayer } from "./services/multiplayer";
import { default as PayVault } from "./services/payvault";

export const Services = {
    Achievements,
    BigDB,
    GameFS,
    Multiplayer,
    PayVault
}

export * as Utilities from "./utilities/util"
export * as MessageSerializer from "./utilities/messageserialiser"

export { default as ByteArray, Endian } from "./structures/ByteArray";