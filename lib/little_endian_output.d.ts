import { Long } from './long';
/** Simple utility for writing little endian primitives to a stream. */
export declare class LittleEndianOutput {
    private capacity;
    private buffer;
    private cursor;
    private readonly float64View;
    private readonly uint8View;
    constructor();
    private check;
    writeByte(value: number): void;
    writeBytes(bytes: ArrayLike<number>): void;
    writeInt(value: number): void;
    writeDouble(value: number): void;
    writeVarint32(value: number): void;
    writeVarint64(bits: Long): void;
    getArray(): Uint8Array;
}
