import { Long } from './long';
/** Simple utility for reading little endian primitives from a stream. */
export declare class LittleEndianInput {
    private readonly buffer;
    private cursor;
    private readonly float64View;
    private readonly uint8View;
    constructor(buffer: Uint8Array);
    private check;
    readByte(): number;
    readBytes(size: number): number[];
    readInt(): number;
    readDouble(): number;
    readVarint32(): number;
    readVarint64(): Long;
}
