import {LittleEndianInput} from './little_endian_input';
import {LittleEndianOutput} from './little_endian_output';
import {MAX_LEVEL} from './s2cell_id';
import {S2Point} from './s2point';
import {decodePointsCompressed, encodePointsCompressed} from './s2point_compression';
import {levelIfCenter, xyzToFaceSiTi} from './s2projections';

const LOSSLESS_ENCODING_VERSION = 1;
const COMPRESSED_ENCODING_VERSION = 2;

/**
 * An S2Polyline represents a sequence of zero or more vertices connected by
 * straight edges (geodesics). Edges of length 0 and 180 degrees are not
 * allowed, i.e. adjacent vertices should not be identical or antipodal.
 */
export class S2Polyline {
  constructor(readonly vertices: readonly S2Point[]) {}

  /**
   * Computes the level at which most of the vertices are snapped. If multiple
   * levels have the same maximum number of vertices snapped to it, the first
   * one (lowest level number / largest area / smallest encoding length) will be
   * chosen, so this is desired. Returns -1 for unsnapped polylines.
   */
  private getBestSnapLevel() {
    const histogram = Array.from<number>({length: MAX_LEVEL + 1}).fill(0);
    for (const p of this.vertices) {
      const faceSiTi = xyzToFaceSiTi(p);
      const level = levelIfCenter(faceSiTi, p);
      // Level is -1 for unsnapped points.
      if (level >= 0) {
        histogram[level]++;
      }
    }
    let snapLevel = 0;
    for (let i = 1; i < histogram.length; i++) {
      if (histogram[i] > histogram[snapLevel]) {
        snapLevel = i;
      }
    }
    if (histogram[snapLevel] === 0 && this.vertices.length > 0) {
      // This is an unsnapped polyline.
      return -1;
    }
    return snapLevel;
  }

  /**
   * Encodes the polyline into an efficient, lossless binary representation,
   * which can be decoded by calling {@link S2Polyline#decode}. The encoding is
   * byte-compatible with the C++ version of the S2 library.
   */
  encodeCompact() {
    const numVertices = this.vertices.length;
    const level = numVertices === 0 ? MAX_LEVEL : this.getBestSnapLevel();
    const encoder = new LittleEndianOutput();
    if (level === -1) {
      this.encodeUncompressed(encoder);
    } else {
      this.encodeCompressed(level, encoder);
    }
    return encoder.getArray();
  }

  /** Encodes this polyline into the given little endian output stream. */
  private encodeUncompressed(encoder: LittleEndianOutput) {
    encoder.writeByte(LOSSLESS_ENCODING_VERSION);
    encoder.writeInt(this.vertices.length);
    for (const p of this.vertices) {
      p.encode(encoder);
    }
  }

  /** Encodes a compressed polyline at requested snap level. */
  private encodeCompressed(snapLevel: number, encoder: LittleEndianOutput) {
    encoder.writeByte(COMPRESSED_ENCODING_VERSION);
    encoder.writeByte(snapLevel);
    encoder.writeVarint32(this.vertices.length);
    encodePointsCompressed(this.vertices, snapLevel, encoder);
  }

  static decode(bytes: Uint8Array) {
    const decoder = new LittleEndianInput(bytes);
    const version = decoder.readByte();
    if (version === LOSSLESS_ENCODING_VERSION) {
      return S2Polyline.decodeLossless(decoder);
    } else if (version === COMPRESSED_ENCODING_VERSION) {
      return S2Polyline.decodeCompressed(decoder);
    } else {
      throw new Error(`Unsupported S2Polyline encoding version ${version}`);
    }
  }

  private static decodeLossless(decoder: LittleEndianInput) {
    const vertices: S2Point[] = [];
    const numVertices = decoder.readInt();
    for (let i = 0; i < numVertices; i++) {
      vertices.push(S2Point.decode(decoder));
    }
    return new S2Polyline(vertices);
  }

  private static decodeCompressed(decoder: LittleEndianInput) {
    const level = decoder.readByte();
    if (level > MAX_LEVEL) {
      throw new Error(`Invalid level ${level}`);
    }
    const numVertices = decoder.readVarint32();
    const vertices = decodePointsCompressed(numVertices, level, decoder);
    return new S2Polyline(vertices);
  }
}
