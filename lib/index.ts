'use strict';

export { default as PlayerIOClient } from "./client";
export { default as Message } from "./message";
export { default as HTTPChannel } from "./channel";
export { default as QuickConnect } from "./quickconnect";
export * as Constants from "./constants";

export { default as PlayerIOError } from "./error";

// services
import Achievements from "./services/achievements";
import BigDB from "./services/bigdb";
import Connection from "./services/connection";
import GameFS from "./services/gamefs";
import Multiplayer from "./services/multiplayer";
import PayVault from "./services/payvault";

export const Services = {
    Achievements,
    BigDB,
    Connection,
    GameFS,
    Multiplayer,
    PayVault
}

export * as Utilities from "./utilities/util"
export * as MessageSerializer from "./utilities/messageserialiser"

export { default as ByteArray, Endian } from "./structures/ByteArray";