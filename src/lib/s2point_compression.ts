import {decodeZigZag32, deinterleaveBits1, deinterleaveBits2, encodeZigZag32, interleaveBits} from './encoded_ints';
import {LittleEndianInput} from './little_endian_input';
import {LittleEndianOutput} from './little_endian_output';
import {Long} from './long';
import {MAX_LEVEL, NUM_FACES} from './s2cell_id';
import {S2Point} from './s2point';
import {faceUvToXyz, levelIfCenter, MAX_SITI, stToUV, xyzToFaceSiTi} from './s2projections';

const DERIVATIVE_ENCODING_ORDER = 2;

class FaceRun {
  constructor(readonly face: number, public count: number) {}
}

class FaceRunCoder {
  private readonly faces: FaceRun[] = [];

  addFace(face: number) {
    const lastRun =
        this.faces.length > 0 ? this.faces[this.faces.length - 1] : null;
    if (lastRun !== null && lastRun.face === face) {
      lastRun.count++;
    } else {
      this.faces.push(new FaceRun(face, 1));
    }
  }

  encode(encoder: LittleEndianOutput) {
    for (const run of this.faces) {
      // It isn't necessary to encode the number of faces left for the last run,
      // but since this would only help if there were more than 21 faces, it
      // will be a small overall savings, much smaller than the bound encoding.
      encoder.writeVarint64(
          Long.fromUnsignedInt32(NUM_FACES * run.count + run.face));
    }
  }

  decode(vertices: number, decoder: LittleEndianInput) {
    let facesParsed = 0;
    while (facesParsed < vertices) {
      const faceAndCount = decoder.readVarint64().toUnsignedInt32();
      const run = new FaceRun(
          faceAndCount % NUM_FACES, Math.floor(faceAndCount / NUM_FACES));
      this.faces.push(run);
      facesParsed += run.count;
    }
  }

  getFaceIterator() {
    const faces = this.faces;
    let i = 0;
    // Special case if there are not faces at all.
    if (faces.length === 0) {
      return {
        next() {
          throw new Error('No such element');
        }
      };
    }

    let currentFaceRun = faces[i++];
    let usedCountForCurrentFaceRun = 0;
    return {
      next() {
        if (usedCountForCurrentFaceRun < currentFaceRun.count) {
          usedCountForCurrentFaceRun++;
        } else {
          usedCountForCurrentFaceRun = 1;
          currentFaceRun = faces[i++];
        }
        return currentFaceRun.face;
      }
    };
  }
}

class NthDerivativeCoder {
  /** The range of supported Ns is [N_MIN, N_MAX]. */
  private static readonly N_MIN = 0;
  private static readonly N_MAX = 10;

  /** The derivative order of the coder (the N in NthDerivative). */
  private readonly n: number;

  /** The derivative order in which to code the next value (ramps up to n). */
  private m = 0;

  /** Value memory, from oldest to newest. */
  private readonly memory: number[] = new Array(NthDerivativeCoder.N_MAX);

  constructor(n: number) {
    if (n < NthDerivativeCoder.N_MIN || n > NthDerivativeCoder.N_MAX) {
      throw new Error(`Unsupported N: ${n}`);
    }
    this.n = n;
    this.reset();
  }

  encode(k: number) {
    for (let i = 0; i < this.m; i++) {
      const delta = k - this.memory[i];
      this.memory[i] = k;
      k = delta;
    }
    if (this.m < this.n) {
      this.memory[this.m++] = k;
    }
    return k;
  }

  decode(k: number) {
    if (this.m < this.n) {
      this.m++;
    }
    for (let i = this.m - 1; i >= 0; i--) {
      this.memory[i] += k;
      k = this.memory[i];
    }
    return k;
  }

  reset() {
    for (let i = 0; i < this.n; i++) {
      this.memory[i] = 0;
    }
    this.m = 0;
  }
}

function siTiToPiQi(si: number, level: number) {
  si = Math.min(si, MAX_SITI - 1);
  return si >>> (MAX_LEVEL + 1 - level);
}

function piQiToST(pi: number, level: number) {
  // We want to recover the position at the center of the cell. If the point was
  // snapped to the center of the cell, then modf(s * 2^level) == 0.5. Inverting
  // STtoPiQi gives: s = (pi + 0.5) / 2^level.
  return (pi + 0.5) / (1 << level);
}

function facePiQiToXyz(face: number, pi: number, qi: number, level: number) {
  return faceUvToXyz(
             face, stToUV(piQiToST(pi, level)), stToUV(piQiToST(qi, level)))
      .normalize();
}

/**
 * Encodes a list of points into an efficient, lossless binary representation,
 * which can be decoded by calling {@link decodePointsCompressed}. The encoding
 * is byte-compatible with the C++ version of the S2 library.
 *
 * Points that are snapped to the specified level will require approximately 4
 * bytes per point, while other points will require 24 bytes per point.
 */
export function encodePointsCompressed(
    points: readonly S2Point[], level: number, encoder: LittleEndianOutput) {
  // Convert the points to (face, pi, qi) coordinates.
  const faces = new FaceRunCoder();
  const verticesPi: number[] = [];
  const verticesQi: number[] = [];
  const offCenter: number[] = [];
  for (let i = 0; i < points.length; i++) {
    const faceSiTi = xyzToFaceSiTi(points[i]);
    faces.addFace(faceSiTi.face);
    verticesPi.push(siTiToPiQi(faceSiTi.si, level));
    verticesQi.push(siTiToPiQi(faceSiTi.ti, level));
    if (levelIfCenter(faceSiTi, points[i]) !== level) {
      offCenter.push(i);
    }
  }

  // Encode the runs of the faces.
  faces.encode(encoder);

  // Encode the (pi, qi) coordinates of all the points, in order.
  const piCoder = new NthDerivativeCoder(DERIVATIVE_ENCODING_ORDER);
  const qiCoder = new NthDerivativeCoder(DERIVATIVE_ENCODING_ORDER);
  for (let i = 0; i < verticesPi.length; i++) {
    const pi = piCoder.encode(verticesPi[i]);
    const qi = qiCoder.encode(verticesQi[i]);
    if (i === 0) {
      // The first point will be just the (pi, qi) coordinates of the S2Point.
      // NthDerivativeCoder will not save anything in that case, so we encode in
      // fixed format rather than varint to avoid the varint overhead.

      // Interleave to reduce overhead from two partial bytes to one.
      const interleavedPiQi = interleaveBits(pi, qi).toBytes();

      // We only write as many bytes as are actually required for the given
      // level, i.e. we wish to truncate the byte representation of the long.
      const bytesRequired = Math.floor((level + 7) / 8) * 2;
      interleavedPiQi.splice(bytesRequired);
      encoder.writeBytes(interleavedPiQi);
    } else {
      // ZigZagEncode, as varint requires the maximum number of bytes for
      // negative numbers.
      const zigZagEncodedPi = encodeZigZag32(pi);
      const zigZagEncodedQi = encodeZigZag32(qi);

      // Interleave to reduce overhead from two partial bytes to one.
      const interleavedPiQi = interleaveBits(zigZagEncodedPi, zigZagEncodedQi);
      encoder.writeVarint64(interleavedPiQi);
    }
  }

  // Encode the number of off-center points.
  encoder.writeVarint32(offCenter.length);

  // Encode the actual off-center points.
  for (const index of offCenter) {
    encoder.writeVarint32(index);
    points[index].encode(encoder);
  }
}

/**
 * Decodes a list of points that were encoded using {@link
 * encodePointsCompressed}.
 *
 * Points that are snapped to the specified level will require approximately 4
 * bytes per point, while other points will require 24 bytes per point.
 */
export function decodePointsCompressed(
    numVertices: number, level: number, decoder: LittleEndianInput) {
  const vertices: S2Point[] = [];

  const faces = new FaceRunCoder();
  faces.decode(numVertices, decoder);
  const faceIterator = faces.getFaceIterator();

  const piCoder = new NthDerivativeCoder(DERIVATIVE_ENCODING_ORDER);
  const qiCoder = new NthDerivativeCoder(DERIVATIVE_ENCODING_ORDER);
  for (let i = 0; i < numVertices; i++) {
    let pi: number;
    let qi: number;
    if (i === 0) {
      const bytesRequired = Math.floor((level + 7) / 8) * 2;
      const littleEndianBytes = decoder.readBytes(bytesRequired);
      while (littleEndianBytes.length < 8) {
        littleEndianBytes.push(0);
      }
      const interleavedPiQi = Long.fromBytes(littleEndianBytes);
      pi = piCoder.decode(deinterleaveBits1(interleavedPiQi));
      qi = qiCoder.decode(deinterleaveBits2(interleavedPiQi));
    } else {
      const piqi = decoder.readVarint64();
      pi = piCoder.decode(decodeZigZag32(deinterleaveBits1(piqi)));
      qi = qiCoder.decode(decodeZigZag32(deinterleaveBits2(piqi)));
    }
    const face = faceIterator.next();
    vertices.push(facePiQiToXyz(face, pi, qi, level));
  }

  // Now decode the off-center points.
  const numOffCenter = decoder.readVarint32();
  if (numOffCenter > numVertices) {
    throw new Error(
        'Number of off-center points is greater than total amount of points.');
  }
  for (let i = 0; i < numOffCenter; i++) {
    const index = decoder.readVarint32();
    const x = decoder.readDouble();
    const y = decoder.readDouble();
    const z = decoder.readDouble();
    vertices[index] = new S2Point(x, y, z);
  }

  return vertices;
}

export const TEST_ONLY = {NthDerivativeCoder};
