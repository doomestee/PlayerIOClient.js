import { EntryType } from "./utilities";

export = class Message {
    constructor(type: string);

    /**
     * Type of the message.
     */
    type: string;

    protected types: [];
    
    /**
     * If you want to screw using .get() and stuff, you can use this.
     * 
     * Zero-indexed array
     */
    objects: [];

    /**
     * The number of entries in this message.
     */
    get length(): number;

    /**
     * Adds data entries to the Message object
     * @param args Entries to add. Valid types are Number, String, Boolean and ByteArray. If a Number is passed, and it is an integer, it will be added to the first type it fits in this order: Int, UInt, Long, ULong. If it doesn't fit in any integer type, or if it's not an integer, it will be added as a Double.
     */
    add(...args): void;

    /**
     * Add a value encoded as an int to the message
     * @param value The number to add
     */
    addInt(value: number): void;

    /**
     * Add a value encoded as an uint to the message
     * @param value The number to add
     */
    addUInt(value: number): void;

    /**
     * Add a value encoded as a long to the message
     * @param value The number to add
     */
    addLong(value: number): void;

    /**
     * Add a value encoded as a ulong to the message
     * @param value The number to add
     */
    addULong(value: number): void;

    /**
     * Add a value encoded as a float to the message
     * @param value The number to add
     */
    addFloat(value: number): void;

    /**
     * Add a value encoded as a double to the message
     * @param value The number to add
     */
    addDouble(value: number): void;

    /**
     * Add a boolean value to the message
     * @param value The boolean to add
     */
    addBoolean(value: boolean): void;

    /**
     * Add a byte array value to the message
     * @param value The byte array to add
     */
    addByteArray(value: number[]): void;

    /**
     * Add a string value to the message
     * @param value The string to add
     */
    addString(value: string): void;

    /**
     * Get the int from the message at the given index.
     * 
     * Use getNumber if you want to bypass check for any kind of number (such as long, double etc).
     * @param value The zero-based index of the entry to get.
     */
    getInt(index: number): number;

    /**
     * Get the uint from the message at the given index.
     * 
     * Use getNumber if you want to bypass check for any kind of number (such as long, double etc).
     * @param value The zero-based index of the entry to get.
     */
    getUInt(index: number): number;

    /**
     * Get the long from the message at the given index.
     * 
     * Use getNumber if you want to bypass check for any kind of number (such as long, double etc).
     * @param value The zero-based index of the entry to get.
     */
    getLong(index: number): number;

    /**
     * Get the ulong from the message at the given index.
     * 
     * Use getNumber if you want to bypass check for any kind of number (such as long, double etc).
     * @param value The zero-based index of the entry to get.
     */
    getULong(index: number): number;

    /**
     * Get the float from the message at the given index.
     * 
     * Use getNumber if you want to bypass check for any kind of number (such as long, double etc).
     * @param value The zero-based index of the entry to get.
     */
    getFloat(index: number): number;

    /**
     * Get the double from the message at the given index.
     * 
     * Use getNumber if you want to bypass check for any kind of number (such as long, double etc).
     * @param value The zero-based index of the entry to get.
     */
    getDouble(index: number): number;

    /**
     * Get the number (int, uint, long, ulong, float, double) from the message at the given index.
     * 
     * @param value The zero-based index of the entry to get.
     */
    getNumber(index: number): number;

    /**
     * Get the boolean from the message at the given index.
     * @param value The zero-based index of the entry to get.
     */
    getBoolean(index: number): boolean;

    /**
     * Get the byte array from the message at the given index.
     * @param value The zero-based index of the entry to get.
     */
    getByteArray(index: number): number[];

    /**
     * Get the string from the message at the given index.
     * @param value The zero-based index of the entry to get.
     */
    getString(index: number): string;

    /**
     * Get a string representation of the message
     */
    toString(index: number): string;

    _internal_(method: "get-types"): number[];
    _internal_(method: "get-objects"): any[];

    addT(check: boolean, value: any, type: number, errorMessage: string): unknown;

    /**
     * @param index The index of the entry to get.
     * @param type The type of the entry to validate against.
     */
    get(index: number, type: EntryType.Integer|EntryType.UnsignedInteger|EntryType.Long|EntryType.UnsignedLong|EntryType.Double|EntryType.Float): number;
    get(index: number, type: EntryType.String): string;
    get(index: number, type: EntryType.ByteArray): number[];
    get(index: number, type: EntryType.Boolean): boolean;

    getTypeString(type: EntryType.Integer): "Integer";
    getTypeString(type: EntryType.UnsignedInteger): "Unsigned Integer";
    getTypeString(type: EntryType.Long): "Long";
    getTypeString(type: EntryType.UnsignedLong): "Unsigned Long";
    getTypeString(type: EntryType.Double): "Double";
    getTypeString(type: EntryType.Float): "Float";
    getTypeString(type: EntryType.String): "String";
    getTypeString(type: EntryType.ByteArray): "ByteArray";
    getTypeString(type: EntryType.Boolean): "Boolean";
    getTypeString(type: 69): "Number";

    isByteArray(value: Buffer): boolean;
}