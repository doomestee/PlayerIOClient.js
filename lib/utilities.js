/**
 * NOTE most of the code hare are yoinked from the development file for better chance of success without much need for tampering.
 */

const PlayerIOError = require("./playerioerror");

module.exports = {
    /**
     * @param {Object} obj 
     * @returns {{key: string, value: string}[]}
     */
    convertToKVArray: function(obj) {
        let result = []
        if (obj) {
            for (let k in obj) {
                result.push({ key: (''+k), value: (''+obj[k])})
            }
        }
        return result;
    },

    /**
     * KVArray is a dictionary (in C#)
     * @param {{key: string, value: string}[]} arr
     * @returns {Object}
     */
    convertFromKVArray: function(arr){
        let result = {}
        if(arr && arr.length){
            for(let k in arr){
                result[ arr[k].key ] = arr[k].value
            }
        }
        return result;
    },

    /**
     * @param {{}} object 
     * @returns {string[]}
     */
    convertToSegmentArray: function (object) {
        let result = [];
        if (object) {
            for (let k in object) {
                result.push(k + ':' + object[k]);
            }
        }
        return result;
    },

    compareForChanges: function (original, current, isObject, isRoot) {
		let changes = []

		// loop over all values in the current object
		// to find sets and changes
		for (let key in current) {
			let value = current[key];
			let valueOriginal = original ? original[key] : null

			switch (key) {
				case 'table': if (isRoot) continue;
				case 'key': if (isRoot) continue;
				case 'save': if (isRoot) continue;
				case 'existsInDatabase': if (isRoot) continue;
				case '_internal_': if (isRoot) continue;
				case '_circular_reference_finder_': continue;
			}

			if (value != null) {
				let prop = isObject ? { name: key} : { index: parseInt(key) }

				switch (typeof (value)) {
					case 'boolean':
						if (value != valueOriginal) {
							prop.value = { valuetype: this.ValueType.Bool, bool: value }
							changes.push(prop)
						}
						break;
					case 'number':
						if (value != valueOriginal) {
							if (isFinite(value) && Math.floor(value) === value) {
								if (value >= -2147483648 && value <= 2147483647) {
									prop.value = { valuetype: this.ValueType.Int, int: value }
								} else if (value > 0 && value <= 4294967295) {
									prop.value = { valuetype: this.ValueType.UInt, uint: value }
								} else if (value >= -9223372036854775000 && value <= 9223372036854775000) { //Boundary is rounded because max_long and min_long can't be accurately represented as double
									prop.value = { valuetype: this.ValueType.Long, long: value }
								} else if (value > 0 && value <= 18446744073709550000) { //Boundary is rounded because max_ulong can't be accurately represented as double
									prop.value = { valuetype: this.ValueType.ULong, ulong: value }
								} else {
									prop.value = { valuetype: this.ValueType.Double, double: value }
								}
							} else {
								prop.value = { valuetype: this.ValueType.Double, double: value }
							}
							changes.push(prop)
						}
						break;
					case 'string':
						if (value != valueOriginal) {
							prop.value = { valuetype: this.ValueType.String, string: value }
							changes.push(prop)
						}
						break;
					case 'object': // date, object & array
						if (value.getTime && value.getMilliseconds) { // date
							if (value + '' != valueOriginal + '') {
								prop.value = { valuetype: this.ValueType.DateTime, datetime: value.getTime() }
								changes.push(prop)
							}
						} else {
							// check for circular references
							if (value._circular_reference_finder_) {
								throw new PlayerIOError(PlayerIOErrorCode.CircularReference, "The object you're trying to save contains a circular reference for " + (isObject ? "a property named" : "the array entry") + "): " + key)
							} else {
								value._circular_reference_finder_ = true;
							}

							let valueIsArray = value instanceof Array;
							if (valueIsArray && value.bytearray) {
								let bytes = new Array(value.length);
								for (let i = 0; i != bytes.length; i++) {
									let val = value[i];
									if (val >= 0 && val <= 255) {
										bytes[i] = val
									} else {
										throw new PlayerIOError(PlayerIOErrorCode.GeneralError, "The bytearray property '" + key + "' was supposed to only contain byte (0-255) values, but contained the value: " + val);
									}
								}
								prop.value = { valuetype: this.ValueType.ByteArray, bytearray: bytes }
							} else {
								let subChanges = this.compareForChanges(valueOriginal, value, !valueIsArray, false);
								if (valueIsArray) {
									prop.value = { valuetype: this.ValueType.Array, arrayproperties: subChanges }
								} else {
									prop.value = { valuetype: this.ValueType.Obj, objectproperties: subChanges }
								}
							}
							changes.push(prop)

							// remove circular reference finder
							delete value._circular_reference_finder_;
						}
						break;
					case 'undefined': break;
					case 'function': break;
					default: throw new Error("Don't know how to serialize type '" + typeof value + "' for BigDB");
				}
			}
		}

		// loop over all values in the original object to find
		// properties that were deleted
		for (let key in original) {
			if (current[key] == null || typeof (current[key]) == 'undefined') {
				// property was deleted
				changes.push(isObject ? { name: key} : { index: parseInt(key) }); //getProp(null, key, isObject));
			}
		}

		return changes;
	},

    /**
     * @type {{String:0,Int:1,UInt:2,Long:3,Bool:4,Float:5,Double:6,ByteArray:7,DateTime:8,Array:9,Obj:10}} type is for intellisense.
     */
    ValueType: {String:0,Int:1,UInt:2,Long:3,Bool:4,Float:5,Double:6,ByteArray:7,DateTime:8,Array:9,Obj:10},
    
    /**
     * @type {{NoLocks:0,LockIndividual:1,LockAll:2}}
     */
    LockType: {NoLocks:0,LockIndividual:1,LockAll:2},

	entryType_Integer: 0,
	entryType_UnsignedInteger: 1,
	entryType_Long: 2,
	entryType_UnsignedLong: 3,
	entryType_Double: 4,
	entryType_Float: 5,
	entryType_String: 6,
	entryType_ByteArray: 7,
	entryType_Boolean: 8,
}