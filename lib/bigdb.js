const PlayerIOError = require("./playerioerror");
const { ValueType, compareForChanges, LockType } = require("./utilities");
const PlayerIOErrorCode = PlayerIOError.PlayerIOErrorCode;

/**
 * The GameFS service. This class is used to get an absolute URL for assets you have stored in GameFS.
 */
class BigDB {
    /**
     * @param {import("./channel")} channel
     */
    constructor(channel) {
        this.channel = channel;
        this.queuedSaves = [];
    }

    /**
    * Creates a new database object in the given table with the specified key. If no key is specified (null), the object will receive an autogenerated id.
    * @param {string} table The name of the table to create the database object in.
    * @param {string} key The key to assign to the database object.
    * @param {object} obj The database object to create in the table.
    */
    createObject(table, key, obj) {
        let properties = compareForChanges({}, obj || {}, true, true);

        return this.channel.createObjects([{ key: key, table: table, properties: properties}], false)
            .then(results => {
                if (res.objects.length === 1) {
                    return new DatabaseObject(this, table, results.objects[0].key, results.objects[0].version, false, properties);
                } else {
                    throw new PlayerIOError(PlayerIOErrorCode.GeneralError, "Error creating object");
                }
            })
    }

    /**
    * Loads the database object corresponding to the player from the PlayerObjects table.
    */
    loadMyPlayerObject() {
        return this.channel.loadMyPlayerObject()
            .then(result => { return new DatabaseObject(this, "PlayerObjects", result.playerobject.key, result.playerobject.version, true, result.playerobject.properties); });
    }

    /**
    * Load the database object with the given key from the given table.
    * @param {string} table The table to load the database object from.
    * @param {string} key The key of the database object to load.
    */
    load(table, key) {
        return this.channel.loadObjects([{ table: table, keys: [key]}])
            .then(results => {
                if (results.objects.length == 1) {
                    return results.objects[0] == null ? null : new DatabaseObject(this, table, results.objects[0].key, results.objects[0].version, false, results.objects[0].properties);
                } else {
                    throw new PlayerIOError(PlayerIOErrorCode.GeneralError, "Error loading object");
                }
            });
    }

    /**
    * Loads the database objects with the given keys from the given table.
    * @param {string} table The table to load the database objects from.
    * @param {string[]} keys The keys of the database objects to load.
    */
    loadKeys(table, keys) {
        return this.channel.loadObjects([{ table: table, keys: keys}])
            .then((results) => {
                let ret = [];

                for (let i = 0; i < results.objects.length; i++) {
                    let obj = results.objects[i];
                    ret[i] = obj == null ? null : new DatabaseObject(this, table, obj.key, obj.version, false, obj.properties);
                }
            });
    }

    /**
    * Loads or creates the database object with the given key from the given table.
    * @param {string} table The table from which to load or create the database object
    * @param {string} key The key of the database object to load or create
    */
    loadOrCreate(table, key) {
        return this.channel.createObjects([{ key: key, table: table, properties: []}], true)
            .then((results) => {
                if (results.objects.length == 1) return new DatabaseObject(this, table, results.objects[0].key, results.objects[0].version, false, results.objects[0].properties);
                else throw new PlayerIOError(PlayerIOErrorCode.GeneralError, "Error creating object");
            });
    }

    /**
    * Delete a set of database objects from a table.
    * @param {string} table The table to delete the database objects from.
    * @param {string[]} keys The keys of the database objects to delete.
    */
    deleteKeys(table, keys) {
        return this.channel.deleteObjects([{ table: table, keys: keys}]);
    }

    /**
    * Loads or creates database objects with the given keys from the given table. New objects are created if there are no existing objects for the given keys.
    * @param {string} table The table from which to load or create the database objects.
    * @param {string[]} keys The keys of the database objects to load or create.
    */
    loadKeysOrCreate(table, keys) {
        let objectIds = [];
        for (let i = 0; i != keys.length; i++) {
            objectIds.push({ key: keys[i], table: table, properties: [] })
        }

        return this.channel.createObjects(objectIds, true)
            .then((results) => {
            let ret = [];
            for (let i = 0; i != results.objects.length; i++) {
                let obj = results.objects[i];
                ret[i] = new DatabaseObject(this, table, obj.key, obj.version, false, obj.properties);
            }
            return ret;
        })
    }

    /**
    * Load a database object from a table using the specified index.
    * @param {string} table The table to load the database object from.
    * @param {string} index The name of the index to query for the database object.
    * @param {array} indexValue An array of objects of the same types as the index properties, specifying which object to load.
    */
    loadSingle(table, index, indexValue) {
        return this.channel.loadMatchingObjects(table, index, this.getIndexValue(indexValue), 1)
            .then((results) => {
                return results.objects.length == 0 ? null : new DatabaseObject(this, table, results.objects[0].key, results.objects[0].version, false, results.objects[0].properties);
            })
    }

    /**
    * Load a range of database objects from a table using the specified index.
    * @param {string} table The table to load the database objects from.
    * @param {string} index The name of the index to query for the database objects.
    * @param {array} indexPath Where in the index to start the range search: An array of objects of the same types as the index properties, specifying where in the index to start loading database objects from. For instance, in the index [Mode,Map,Score] you might use new object[]{"expert","skyland"} as the indexPath and use the start and stop arguments to determine the range of scores you wish to return. IndexPath can be set to null if there is only one property in the index.
    * @param {object} start Where to start the range search. For instance, if the index is [Mode,Map,Score] and indexPath is ["expert","skyland"], then start defines the minimum score to include in the results.
    * @param {object} stop Where to stop the range search. For instance, if the index is [Mode,Map,Score] and indexPath is ["expert","skyland"], then stop defines the maximum score to include in the results.
    * @param {int} limit The max amount of objects to return.
    */
    loadRange(table, index, indexPath, start, stop, limit) {
        return this.channel.loadIndexRange(table, index, this.getIndexValue(indexPath, start), this.getIndexValue(indexPath, stop), limit)
            .then((results) => {
                let ret = [];
                for (let i = 0; i != results.objects.length; i++) {
                    let obj = results.objects[i];
                    ret[i] = obj == null ? null : new DatabaseObject(this, table, obj.key, obj.version, false, obj.properties);
                }
                return ret;
            })
    }

    /**
    * Delete a range of database objects from a table using an index.
    * @param {string} table The table to delete the database object from.
    * @param {string} index The name of the index to query for the database objects to delete.
    * @param {array} indexPath Where in the index to start the range delete: An array of objects of the same types as the index properties, specifying where in the index to start loading database objects from. For instance, in the index [Mode,Map,Score] you might use new object[]{"expert","skyland"} as the indexPath and use the start and stop arguments to determine the range of scores you wish to delete. IndexPath can be set to null instead of an empty array.
    * @param {object} start Where to start the range delete. For instance, if the index is [Mode,Map,Score] and indexPath is ["expert","skyland"], then start defines the minimum score to delete.
    */
    deleteRange(table, index, indexPath, start, stop) {
        return this.channel.deleteIndexRange(table, index, this.getIndexValue(indexPath, start), this.getIndexValue(indexPath, stop));
    }

    /**
     * DON'T USE THIS, not fully tested.
    * Save changes to one or more database objects in one go.
    * @param {bool} useOptimisticLock Should the save only go through, if no other process has modified the object since it was loaded?
    * @param {bool} fullOverwrite Will completely overwrite the database object in BigDB with the properties in this instance, instead of just sending the changed properties to the server.
    * @param {array} objects The objects with changes to save.
    * @param {boolean} createIfMissing
    */
    saveChanges(useOptimisticLock, fullOverwrite, objects, createIfMissing) {
        createIfMissing = createIfMissing === true;
        let changesets = [];
        for (let i in objects) {
            let obj = objects[i];

            // verify that it's a databaseobject
            if (!obj.existsInDatabase || !obj.key || !obj.table || !obj._internal_ || !obj.save) {
                throw Error("You can only save database objects that exist in the database");
            }

            // get changeset for object
            let changes = compareForChanges(fullOverwrite ? {} : obj._internal_('get-dbCurrent'), obj, true, true)
            if (fullOverwrite || changes.length > 0) {
                changesets.push({
                    key: obj._internal_('get-key'),
                    table: obj._internal_('get-table'),
                    fulloverwrite: fullOverwrite,
                    onlyifversion: useOptimisticLock ? obj._internal_('get-version') : null,
                    changes: changes
                })
            }
        }

        // queue the save
        queuedSaves.push({
            objects: objects,
            changesets: changesets,
            fullOverwrite: fullOverwrite,
            useOptimisticLock: useOptimisticLock,
            futureSaves: [],
            setIsSavingOnAll: function (value) {
                for (let i = 0; i != this.objects.length; i++) {
                    this.objects[i]._internal_('set-is-saving', value)
                }
            },
            done: function () {
                this.setIsSavingOnAll(false);
                startSaves();
            },
            /**
             * @param {import("./channel")} channel
             */
            execute: function (channel) {
                let self = this;

                // mark as saving
                self.setIsSavingOnAll(true);

                // save changes to server
                if (self.changesets.length > 0) {
                    channel.saveObjectChanges(LockType.LockAll, self.changesets, createIfMissing)
                        .then(result => {
                            for (let i = 0; i != self.objects.length; i++) {
                                let obj = self.objects[i];
                                obj._internal_('set-version', result.versions[i])
                                obj._internal_('change-dbCurrent', self.changesets[i].changes)
    
                                // remove changes from any of the future saves we took changes from
                                for (let x = 0; x != self.futureSaves.length; x++) {
                                    let futureSave = self.futureSaves[x];
                                    for (let o = 0; o < futureSave.objects.length; o++) {
                                        if (futureSave.objects[o] == obj) {
                                            futureSave.changesets.splice(o, 1);
                                            futureSave.objects.splice(o, 1);
                                            o--;
                                        }
                                    }
                                }
                            }
    
                            self.done();
                        })
                } else {
                    self.done();
                    return;//setTimeout(successCallback, 1);
                }
            }
        })

        startSaves();
    }

    startSaves() {
        for (let s = 0; s < queuedSaves.length; s++) {
            let save = queuedSaves[s];
            let canSave = true;

            for (let i in save.objects) {
                if (save.objects[i]._internal_('get-is-saving')) {
                    //console.log(save.objects[i].key + " is already saving...");
                    canSave = false;
                    break;
                }
            }

            // execute the save if ready, or queue for next time
            if (canSave) {
                // scan forward to find newest changeset for each object
                for (let i in save.objects) {
                    for (let f = s + 1; f < queuedSaves.length; f++) {
                        futureSave = queuedSaves[f];
                        for (let o = 0; o < futureSave.objects.length; o++) {
                            // it's the same object, but in the future, in a similar save
                            if (futureSave.objects[o] == save.objects[i] && futureSave.fullOverwrite == save.fullOverwrite && futureSave.useOptimisticLock == save.useOptimisticLock) {
                                // override current changeset with future changeset
                                save.changesets[i] = futureSave.changesets[o];

                                // save a reference to the future save, so we can 
                                // remove the changeset when successful later
                                save.futureSaves.push(futureSave);
                            }
                        }
                    }
                }

                // remove the save from queue
                queuedSaves.splice(s, 1);
                s--;

                // run it
                save.execute(this.channel)
            }
        }
    }

    getIndexValue(values, extraValue) {
        if (values == null) {
            values = []
        } else if (!Array.isArray(values)) {//(values instanceof Array)) {
            values = [values];
        }
        if (extraValue != null) {
            values = values.concat([extraValue]);
        }

        let result = [];
        for (let i = 0; i != values.length; i++) {
            let value = values[i];
            switch (typeof (value)) {
                case 'boolean': result.push({ valuetype: ValueType.Bool, bool: value }); break;
                case 'string': result.push({ valuetype: ValueType.String, string: value }); break;
                case 'number':
                    let isFloatingPoint = value % 1 != 0;
                    if (isFloatingPoint) {
                        
                        result.push({ valuetype: ValueType.Double, double: value })
                    } else {
                        if (value > -2147483648 && value < 2147483647) { // INTEGER RANGE
                            result.push({ valuetype: ValueType.Int, int: value })
                        } else if (value > 0 && value < 4294967295) { // uint
                            result.push({ valuetype: ValueType.UInt, uint: value })
                        } else { // long
                            result.push({ valuetype: ValueType.Long, long: value })
                        }
                    }
                    break;
                case 'object': // date, object & array
                    if (value.getTime && value.getMilliseconds) { // date
                        result.push({ valuetype: ValueType.DateTime, datetime: value.getTime() })
                    } else {
                        throw new Error("Don't know how to serialize type '" + typeof value + "' for BigDB");
                    }
                    break;
                default: throw new Error("Don't know how to serialize type '" + typeof value + "' for BigDB");
            }
        }
        return result;
    }
};

let bigDBDeserialize = function(properties, target, isObject) {
    for (let x in properties) {
        let p = properties[x];
        let key = isObject ? p.name : (p.index || 0);
        let val = p.value;

        if (val) {
            switch (val.valuetype || 0) {
                case ValueType.String: target[key] = val.string || ""; break;
                case ValueType.Int: target[key] = val.int || 0; break;
                case ValueType.UInt: target[key] = val.uint || 0; break;
                case ValueType.Long: target[key] = val.long || 0; break;
                case ValueType.Bool: target[key] = val.bool || 0; break;
                case ValueType.Float: target[key] = val.float || 0.0; break;
                case ValueType.Double: target[key] = val.double || 0.0; break;
                case ValueType.ByteArray:
                    target[key] = val.bytearray;
                    target[key].bytearray = true;
                    break;
                case ValueType.DateTime: target[key] = new Date(val.datetime || 0); break;
                case ValueType.Array:
                    let arr = target[key] instanceof Array ? target[key] : [];
                    bigDBDeserialize(val.arrayproperties, arr, false);
                    target[key] = arr;
                    break;
                case ValueType.Obj:
                    let obj = typeof (target[key]) == 'object' ? target[key] : {}
                    bigDBDeserialize(val.objectproperties, obj, true);
                    target[key] = obj;
                    break;
            }
        } else delete target[key];
    }
}

/**
* This class represents a database object in BigDB. It contains all the data of the database object, as well
* as a method for persisting any changes back to BigDB.
*/
class DatabaseObject {
    /**
     * 
     * @param {BigDB} owner
     * @param {*} table 
     * @param {*} key 
     * @param {*} version 
     * @param {*} createIfMissing 
     * @param {*} properties 
     */
    constructor(owner, table, key, version, createIfMissing, properties) {
        // make an object representing what we think is
        // currently in the database, for future diffs
        this.dbCurrent = {};
        this.isSaving = false;
        bigDBDeserialize(properties, this.dbCurrent, true);

        /** The table of the database object
        * @type string
        */
        this.table = table;

        /** The key of the database object
        * @type string
        */
        this.key = key;

        /** Returns true if this object has been persisted
        * @type bool
        */
        this.existsInDatabase = true;

        this.owner = owner;

        this.createIfMissing = createIfMissing;

        this.version = version;

        bigDBDeserialize(properties, this, true);
    }

    /**
     * Persist the object to the database, using optimistic locking and full overwrite if specified.
     * @param {boolean} useOptimisticLock If true, the save will only be completed if the database object has not changed in BigDB since this instance was loaded.
     * @param {boolean} fullOverwrite Will completely overwrite the database object in BigDB with the properties in this instance, instead of just sending the changed properties to the server.
     */
    save(useOptimisticLocks, fullOverwrite, successCallback, errorCallback) {
        return this.owner.saveChanges(useOptimisticLocks, fullOverwrite, [this], this.createIfMissing);
    }

    _internal_(method, arg1) {
        switch (method) {
            case 'get-table': return this.table;
            case 'get-key': return this.key;
            case 'set-is-saving': this.isSaving = arg1;
            case 'get-is-saving': return this.isSaving;
            case 'get-version': return this.version;
            case 'set-version': this.version = arg1;
            case 'get-dbCurrent': return this.dbCurrent;
            case 'change-dbCurrent': bigDBDeserialize(arg1, this.dbCurrent, true);
        }
    }
}

module.exports = BigDB;
module.exports.bigDBDeserialize = bigDBDeserialize;
module.exports.DatabaseObject = DatabaseObject;