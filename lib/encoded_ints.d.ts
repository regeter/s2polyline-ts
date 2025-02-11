import { Long } from './long';
/**
 * Encodes a ZigZag-encoded 32-bit value. ZigZag encodes signed integers into
 * values that can be efficiently encoded with varint. (Otherwise, negative
 * values must be sign-extended to 64 bits to be varint encoded, thus always
 * taking 10 bytes on the wire.)
 */
export declare function encodeZigZag32(n: number): number;
/**
 * Decodes a ZigZag-encoded 32-bit signed value. ZigZag encodes signed integers
 * into values that can be efficiently encoded with varint. (Otherwise, negative
 * values must be sign-extended to 64 bits to be varint encoded, thus always
 * taking 10 bytes on the wire.)
 */
export declare function decodeZigZag32(n: number): number;
/**
 * Returns the interleaving of bits of val1 and val2, where the LSB of val1 is
 * the LSB of the result, and the MSB of val2 is the MSB of the result.
 */
export declare function interleaveBits(val1: number, val2: number): Long;
/**
 * Returns the first int de-interleaved from the result of {@link
 * interleaveBits}.
 */
export declare function deinterleaveBits1(bits: Long): number;
/**
 * Returns the second int de-interleaved from the result of {@link
 * interleaveBits}.
 */
export declare function deinterleaveBits2(bits: Long): number;
