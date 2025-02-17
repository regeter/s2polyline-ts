import {LittleEndianInput} from './little_endian_input';
import {LittleEndianOutput} from './little_endian_output';

/**
 * An S2Point represents a point on the unit sphere as a 3D vector. Usually
 * points are normalized to be unit length, but some methods do not require
 * this.
 */
export class S2Point {
  constructor(readonly x: number, readonly y: number, readonly z: number) {}

  normalize() {
    const x = this.x, y = this.y, z = this.z;
    let norm = Math.sqrt(x * x + y * y + z * z);
    if (norm !== 0) {
      norm = 1 / norm;
    }
    return new S2Point(x * norm, y * norm, z * norm);
  }

  equals(that: S2Point) {
    return this.x === that.x && this.y === that.y && this.z === that.z;
  }

  /**
   * Returns the index of the largest of x, y, or z by absolute value, as 0, 1
   * or 2 respectively.
   */
  static largestAbsComponent(x: number, y: number, z: number) {
    const absX = Math.abs(x);
    const absY = Math.abs(y);
    const absZ = Math.abs(z);
    return (absX > absY) ? ((absX > absZ) ? 0 : 2) : ((absY > absZ) ? 1 : 2);
  }

  /** Writes this point to the given little endian output stream. */
  encode(encoder: LittleEndianOutput) {
    encoder.writeDouble(this.x);
    encoder.writeDouble(this.y);
    encoder.writeDouble(this.z);
  }

  /** Returns a new S2Point decoded from the given input stream. */
  static decode(decoder: LittleEndianInput) {
    const x = decoder.readDouble();
    const y = decoder.readDouble();
    const z = decoder.readDouble();
    return new S2Point(x, y, z);
  }
}
