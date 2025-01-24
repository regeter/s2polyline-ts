import {Long} from './long';

/** Simple utility for writing little endian primitives to a stream. */
export class LittleEndianOutput {
  private capacity = 32;
  private buffer = new Uint8Array(this.capacity);
  private cursor = 0;
  private readonly float64View: Float64Array;
  private readonly uint8View: Uint8Array;

  constructor() {
    const doubleBuffer = new ArrayBuffer(8);
    this.float64View = new Float64Array(doubleBuffer);
    this.uint8View = new Uint8Array(doubleBuffer);
  }

  private check(numBytes: number) {
    const needed = this.cursor + numBytes;
    if (needed <= this.capacity) {
      return;
    }
    while (needed > this.capacity) {
      this.capacity *= 2;
    }
    const newBuffer = new Uint8Array(this.capacity);
    newBuffer.set(this.buffer);
    this.buffer = newBuffer;
  }

  writeByte(value: number) {
    this.check(1);
    this.buffer[this.cursor++] = value;
  }

  writeBytes(bytes: ArrayLike<number>) {
    this.check(bytes.length);
    this.buffer.set(bytes, this.cursor);
    this.cursor += bytes.length;
  }

  writeInt(value: number) {
    this.check(4);
    this.buffer[this.cursor++] = value & 0xFF;
    this.buffer[this.cursor++] = (value >> 8) & 0xFF;
    this.buffer[this.cursor++] = (value >> 16) & 0xFF;
    this.buffer[this.cursor++] = (value >> 24) & 0xFF;
  }

  writeDouble(value: number) {
    this.float64View[0] = value;
    this.writeBytes(this.uint8View);
  }

  writeVarint32(value: number) {
    while (true) {
      if ((value & ~0x7F) === 0) {
        this.writeByte(value);
        return;
      }
      this.writeByte((value & 0x7F) | 0x80);
      value >>>= 7;
    }
  }

  writeVarint64(bits: Long) {
    let lowBits = bits.lowBits;
    let highBits = bits.highBits;
    // Break the binary representation into chunks of 7 bits, set the 8th bit
    // in each chunk if it's not the final chunk, and append to the result.
    while (highBits !== 0 || (lowBits & ~0x7F) !== 0) {
      this.writeByte((lowBits & 0x7F) | 0x80);
      lowBits = (lowBits >>> 7) | (highBits << 25);
      highBits = highBits >>> 7;
    }
    this.writeByte(lowBits);
  }

  getArray() {
    return this.buffer.subarray(0, this.cursor);
  }
}
