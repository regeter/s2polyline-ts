import {Long} from './long';

/** Simple utility for reading little endian primitives from a stream. */
export class LittleEndianInput {
  private cursor = 0;
  private readonly float64View: Float64Array;
  private readonly uint8View: Uint8Array;

  constructor(private readonly buffer: Uint8Array) {
    const doubleBuffer = new ArrayBuffer(8);
    this.float64View = new Float64Array(doubleBuffer);
    this.uint8View = new Uint8Array(doubleBuffer);
  }

  private check(numBytes: number) {
    if (this.cursor + numBytes > this.buffer.length) {
      throw new Error('EOF');
    }
  }

  readByte() {
    this.check(1);
    return this.buffer[this.cursor++];
  }

  readBytes(size: number) {
    this.check(size);
    const result: number[] = [];
    for (let i = 0; i < size; i++) {
      result.push(this.buffer[this.cursor++]);
    }
    return result;
  }

  readInt() {
    this.check(4);
    let value = 0;
    for (let i = 0; i < 4; i++) {
      value |= this.buffer[this.cursor + i] << (i * 8);
    }
    this.cursor += 4;
    return value;
  }

  readDouble() {
    this.check(8);
    for (let i = 0; i < 8; i++) {
      this.uint8View[i] = this.buffer[this.cursor + i];
    }
    this.cursor += 8;
    return this.float64View[0];
  }

  readVarint32() {
    return this.readVarint64().lowBits;
  }

  readVarint64() {
    let temp = 0;
    let lowBits = 0;
    let highBits = 0;
    let shift = 0;

    // Read the first five bytes of the varint, stopping at the terminator if we
    // see it.
    do {
      temp = this.readByte();
      lowBits |= (temp & 0x7F) << shift;
      shift += 7;
    } while (shift < 32 && temp & 0x80);

    if (shift > 32) {
      // The fifth byte was read, which straddles the low and high dwords,
      // Save its contribution to the high dword.
      highBits |= (temp & 0x7F) >> 4;
    }

    // Read the sixth through tenth byte.
    for (shift = 3; shift < 32 && temp & 0x80; shift += 7) {
      temp = this.readByte();
      highBits |= (temp & 0x7F) << shift;
    }

    if (temp < 128) {
      return new Long(lowBits, highBits);
    }

    // If we did not see the terminator, the encoding was invalid.
    throw new Error('Malformed varint');
  }
}
