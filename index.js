'use strict';

const PlayerIOClient = require('./lib/client');
const Connection = require('./lib/connection');
const Message = require('./lib/message');
const QuickConnect = require('./lib/quickconnect');

module.exports.Client = PlayerIOClient;
module.exports.QuickConnect = QuickConnect;
/**
 * This is exported for easier access to types.
 * If your editor supports intellisense/jsdoc/typescript, you can use this to force your message callback to register the parameter as a Message.
 */
module.exports.Message = Message;
/**
 * This is exported for easier access to types!
 * If you want to make a connection, authenticate/login first then create or join a room and you will receive the connection class.
 */
module.exports.Connection = Connection;