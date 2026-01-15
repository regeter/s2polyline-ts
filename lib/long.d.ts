/**
 * A class that represents a 64-bit 'long' integer. Based on
 * https://github.com/google/closure-library/blob/master/closure/goog/math/long.js
 */
export declare class Long {
    /** The low (signed) 32 bits of the long. */
    readonly lowBits: number;
    /** The high (signed) 32 bits of the long. */
    readonly highBits: number;
    constructor(lowBits: number, highBits: number);
    static fromBytes(bytes: readonly number[]): Long;
    toBytes(): number[];
    static fromUnsignedInt32(value: number): Long;
    toUnsignedInt32(): number;
}
