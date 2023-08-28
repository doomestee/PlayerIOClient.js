import HTTPChannel from "./channel";

class BigDB {
    constructor(channel: HTTPChannel);

    /**
     */
    private channel: HTTPChannel;

    /**
     * Not gonna make it actually protected dw
     */
    private queuedSaves = [];

    /**
     * Creates a new database object in the given table with the specified key. If no key is specified (null), the object will receive an autogenerated id.
     * @param table The name of the table to create the database object in.
     * @param key The key to assign to the database object.
     * @param obj The database object to create in the table.
     */
    createObject(table: string, key: string, obj: Object): Promise<DatabaseObject[]>;

    /**
     * Loads the database object corresponding to the player from the PlayerObjects table.
     */
    createObject(): Promise<DatabaseObject>;

    /**
     * Load the database object with the given key from the given table.
     * @param table The table to load the database object from.
     * @param key The key of the database object to load.
     */
    load(table: string, key: string): Promise<DatabaseObject?>;

    /**
     * Load the database objects with the given keys from the given table.
     * @param table The table to load the database objects from.
     * @param key The keys of the database objects to load.
     */
    loadKeys(table: string, keys: string[]): Promise<(DatabaseObject|null)[]>;

    /**
     * Loads or creates the database object with the given key from the given table.
     * @param table The table from which to load or create the database object.
     * @param key The key of the database object to load or create.
     */
    loadOrCreate(table: string, key: string): Promise<DatabaseObject>;

    /**
     * Delete a set of database objects from a table.
     * @param table The table to delete the database objects from.
     * @param keys The keys of the database objects to delete.
     */
    deleteKeys(table: string, keys: string[]): Promise<unknown>;

    /**
     * Loads or creates database objects with the given keys from the given table. New objects are created if there are no existing objects for the given keys.
     * @param table The table from which to load or create the database objects.
     * @param keys The keys of the database objects to load or create.
     */
    loadKeysOrCreate(table: string, keys: string[]): Promise<DatabaseObject[]>;

    /**
     * Load a database object from a table using the specified index.
     * @param table The table to load the database object from.
     * @param index The name of the index to query for the database object.
     * @param indexValue An array of objects of the same types as the index properties, specifying which object to load.
     */
    loadSingle(table: string, index: string, indexValue: Object[]): Promise<DatabaseObject?>;

    /**
     * Load a range of database objects from a table using the specified index.
     * @param table The table to load the database objects from.
     * @param index The name of the index to query for the database objects.
     * @param indexPath Where in the index to start the range search: An array of objects of the same types as the index properties, specifying where in the index to start loading database objects from. For instance, in the index [Mode,Map,Score] you might use new object[]{"expert","skyland"} as the indexPath and use the start and stop arguments to determine the range of scores you wish to return. IndexPath can be set to null if there is only one property in the index.
     * @param start Where to start the range search. For instance, if the index is [Mode,Map,Score] and indexPath is ["expert","skyland"], then start defines the minimum score to include in the results.
     * @param stop Where to stop the range search. For instance, if the index is [Mode,Map,Score] and indexPath is ["expert","skyland"], then stop defines the maximum score to include in the results.
     * @param limit The max amount of objects to return.
     */
    loadRange(table: string, index: string, indexPath: unknown[], start: Object, stop: Object, limit: number): Promise<(DatabaseObject|null)[]>;

    /**
     * Delete a range of database objects from a table using an index.
     * @param table The table to delete the database object from.
     * @param index The name of the index to query for the database objects to delete.
     * @param indexPath Where in the index to start the range delete: An array of objects of the same types as the index properties, specifying where in the index to start loading database objects from. For instance, in the index [Mode,Map,Score] you might use new object[]{"expert","skyland"} as the indexPath and use the start and stop arguments to determine the range of scores you wish to delete. IndexPath can be set to null instead of an empty array.
     * @param start Where to start the range delete. For instance, if the index is [Mode,Map,Score] and indexPath is ["expert","skyland"], then start defines the minimum score to delete.
     */
    deleteRange(table: string, index: string, indexPath: unknown[], start: Object, stop: Object): Promise<unknown>;

    /**
     * DON'T USE THIS, not tested.
     * Save changes to one or more database objects in one go.
     * @param useOptimisticLock Should the save only go through, if no other process has modified the object since it was loaded?
     * @param fullOverwrite Will completely overwrite the database object in BigDB with the properties in this instance, instead of just sending the changed properties to the server.
     * @param objects The objects with changes to save.
     * @param createIfMissing
     */
    saveChanges(useOptimisticLock: boolean, fulloverwrite: boolean, objects: unknown[], createIfMissing: boolean): unknown;

    protected startSaves(): unknown;

    /**
     * I'm so sorry if I'm butchering the types lmao, still getting the hang of it at this time.
     */
    getIndexValue<T, E>(values: Array<T>, extraValue: Array<E>): Pick<T, E>
}

export = BigDB;

export function bigDBDeserialize(properties, target, isObject): void;

/**
* This class represents a database object in BigDB. It contains all the data of the database object, as well
* as a method for persisting any changes back to BigDB.
*/

export class DatabaseObject {
    constructor(owner: BigDB, table: string, key: string, version: string, createIfMissing: boolean, properties: Object);

    /**
     * This is an object, containing all of the values (mapped by their key).
     * 
     * If typing is important, at least you'll be able to force it? You can use .wrap() on this object in which you must put a Class (not the instance) in the first parameter, that accepts an object for its constructor in its first parameter.
     * 
     * This is also mutated into the class so you could access it straight away.
     * 
     * For example: \<DatabaseObject\>.dbCurrent.isStaff == true
     * 
     * Or: \<DatabaseObject\>.isStaff == true
     * 
     */
    dbCurrent: Object;
    isSaving: boolean;

    /**
     * Table of the database object
     */
    table: string;

    /**
     * Key of the database object
     */
    key: string;

    /**
     * True if this object has been persisted.
     */
    existsInDatabase: true;

    owner: BigDB;

    createIfMissing: boolean;

    version: string;

    /**
     * For the sake of typing idk, the class passed in must accept an object for its first parameter, if you have other more that you want to add in after the 1st parameter, spread it here for args.
     */
    wrap<T = class>(classy: T, ...args): T; 

    /**
     * 
     * @param useOptimisticLocksIf true, the save will only be completed if the database object has not changed in BigDB since this instance was loaded.
     * @param fullOverwrite Will completely overwrite the database object in BigDB with the properties in this instance, instead of just sending the changed properties to the server.
     */
    save(useOptimisticLocks: boolean, fullOverwrite: boolean): unknown;

    _internal_(method, arg1: "get-table"|"get-key"|"get-version"): string;
    _internal_(method, arg1: "get-dbCurrent"): Object;
    _internal_(method, arg1: "get-is-saving"): boolean;
    _internal_(method, arg1: "set-is-saving"|"set-version"|"change-dbCurrent"): void;
}