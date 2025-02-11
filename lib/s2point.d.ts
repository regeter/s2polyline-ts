import { LittleEndianInput } from './little_endian_input';
import { LittleEndianOutput } from './little_endian_output';
/**
 * An S2Point represents a point on the unit sphere as a 3D vector. Usually
 * points are normalized to be unit length, but some methods do not require
 * this.
 */
export declare class S2Point {
    readonly x: number;
    readonly y: number;
    readonly z: number;
    constructor(x: number, y: number, z: number);
    normalize(): S2Point;
    equals(that: S2Point): boolean;
    /**
     * Returns the index of the largest of x, y, or z by absolute value, as 0, 1
     * or 2 respectively.
     */
    static largestAbsComponent(x: number, y: number, z: number): 0 | 1 | 2;
    /** Writes this point to the given little endian output stream. */
    encode(encoder: LittleEndianOutput): void;
    /** Returns a new S2Point decoded from the given input stream. */
    static decode(decoder: LittleEndianInput): S2Point;
}
