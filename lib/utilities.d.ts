export function convertToKVArray(obj: Object): KVArray[];
export function convertFromKVArray(arr: KVArray[]): Object;
export function convertToSegmentArray(object: Object): string[];
export function compareForChanges(original: Object, current: Object, isObject: boolean, isRoot: boolean): { name: string}|{ index: number };

export type KVArray = {
    key: string;
    value: string;
}

declare enum ValueType {
    String = 0,
    Int = 1,
    UInt = 2,
    Long = 3,
    Bool = 4,
    Float = 5,
    Double = 6,
    ByteArray = 7,
    DateTime = 8,
    Array = 9,
    Obj = 10,
}

declare enum LockType {
    NoLocks = 0,
    LockIndividual = 1,
    LockAll = 2
}

enum EntryType {
    Integer = 0,
    UnsignedInteger = 1,
    Long = 2,
    UnsignedLong = 3,
    Double = 4,
    Float = 5,
    String = 6,
    ByteArray = 7,
    Boolean = 8
}