/**
 * A class that represents a 64-bit 'long' integer. Based on
 * https://github.com/google/closure-library/blob/master/closure/goog/math/long.js
 */
export class Long {
  /** The low (signed) 32 bits of the long. */
  readonly lowBits: number;

  /** The high (signed) 32 bits of the long. */
  readonly highBits: number;

  constructor(lowBits: number, highBits: number) {
    // Force into 32 signed bits.
    this.lowBits = lowBits | 0;
    this.highBits = highBits | 0;
  }

  static fromBytes(bytes: readonly number[]) {
    const lowBits = bytes[0] | bytes[1] << 8 | bytes[2] << 16 | bytes[3] << 24;
    const highBits = bytes[4] | bytes[5] << 8 | bytes[6] << 16 | bytes[7] << 24;
    return new Long(lowBits, highBits);
  }

  toBytes() {
    const low = this.lowBits;
    const high = this.highBits;
    return [
      low & 0xFF, (low >> 8) & 0xFF, (low >> 16) & 0xFF, (low >> 24) & 0xFF,
      high & 0xFF, (high >> 8) & 0xFF, (high >> 16) & 0xFF, (high >> 24) & 0xFF
    ];
  }

  static fromUnsignedInt32(value: number) {
    if (value < 0 || value > 0xFFFFFFFF) {
      throw new Error('Value is not an unsigned int32');
    }
    return new Long(value, 0);
  }

  toUnsignedInt32() {
    if (this.highBits !== 0) {
      throw new Error('Not an unsigned int32');
    }
    return this.lowBits >>> 0;
  }
}
