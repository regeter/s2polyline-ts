import {Long} from './long';

/**
 * Encodes a ZigZag-encoded 32-bit value. ZigZag encodes signed integers into
 * values that can be efficiently encoded with varint. (Otherwise, negative
 * values must be sign-extended to 64 bits to be varint encoded, thus always
 * taking 10 bytes on the wire.)
 */
export function encodeZigZag32(n: number) {
  // Note: the right-shift must be arithmetic.
  return (n << 1) ^ (n >> 31);
}

/**
 * Decodes a ZigZag-encoded 32-bit signed value. ZigZag encodes signed integers
 * into values that can be efficiently encoded with varint. (Otherwise, negative
 * values must be sign-extended to 64 bits to be varint encoded, thus always
 * taking 10 bytes on the wire.)
 */
export function decodeZigZag32(n: number) {
  return (n >>> 1) ^ -(n & 1);
}

/**
 * Inserts blank bits between the bits such that the MSB is blank and the LSB is
 * unchanged.
 */
function insertBlankBits(bits: number) {
  bits = bits & 0x0000ffff;
  bits = (bits | (bits << 8)) & 0x00ff00ff;
  bits = (bits | (bits << 4)) & 0x0f0f0f0f;
  bits = (bits | (bits << 2)) & 0x33333333;
  bits = (bits | (bits << 1)) & 0x55555555;
  return bits;
}

/**
 * Returns the interleaving of bits of val1 and val2, where the LSB of val1 is
 * the LSB of the result, and the MSB of val2 is the MSB of the result.
 */
export function interleaveBits(val1: number, val2: number) {
  const lowBits = insertBlankBits(val1) | (insertBlankBits(val2) << 1);
  const highBits =
      insertBlankBits(val1 >> 16) | (insertBlankBits(val2 >> 16) << 1);
  return new Long(lowBits, highBits);
}

/**
 * Reverses {@link insertBlankBits} by extracting the even bits (bit 0, 2,
 * ...).
 */
function removeBlankBits(bits: number) {
  bits &= 0x55555555;
  bits |= bits >>> 1;
  bits &= 0x33333333;
  bits |= bits >>> 2;
  bits &= 0x0f0f0f0f;
  bits |= bits >>> 4;
  bits &= 0x00ff00ff;
  bits |= bits >>> 8;
  bits &= 0x0000ffff;
  return bits;
}

/**
 * Returns the first int de-interleaved from the result of {@link
 * interleaveBits}.
 */
export function deinterleaveBits1(bits: Long) {
  return removeBlankBits(bits.lowBits) | (removeBlankBits(bits.highBits) << 16);
}

/**
 * Returns the second int de-interleaved from the result of {@link
 * interleaveBits}.
 */
export function deinterleaveBits2(bits: Long) {
  return removeBlankBits(bits.lowBits >>> 1) |
      (removeBlankBits(bits.highBits >>> 1) << 16);
}
