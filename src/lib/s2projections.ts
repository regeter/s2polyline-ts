import {MAX_LEVEL} from './s2cell_id';
import {S2Point} from './s2point';

/**
 * The maximum value of an si- or ti-coordinate. The range of valid (si,ti)
 * values is [0..MAX_SITI].
 */
export const MAX_SITI = 2 ** (MAX_LEVEL + 1);

/**
 * Converts an s- or t-value to the corresponding u- or v-value. This is a
 * non-linear transformation from [-1,1] to [-1,1] that attempts to make the
 * cell sizes more uniform.
 */
export function stToUV(s: number) {
  if (s >= 0.5) {
    return (1 / 3) * (4 * s * s - 1);
  } else {
    return (1 / 3) * (1 - 4 * (1 - s) * (1 - s));
  }
}

/** Returns the s- or t-value corresponding to the given si- or ti-value. */
function siTiToSt(si: number) {
  // assert si >= 0 && si <= MAX_SITI;
  return (1 / MAX_SITI) * si;
}

/**
 * A transform from 2D cartesian coordinates of a face to 3D directional
 * vectors. The resulting vectors are not necessarily of unit length.
 */
interface XyzTransform {
  uvToX(u: number, v: number): number;
  uvToY(u: number, v: number): number;
  uvToZ(u: number, v: number): number;
}

const XYZ_TRANSFORMS: XyzTransform[] = [
  {uvToX: (u, v) => 1, uvToY: (u, v) => u, uvToZ: (u, v) => v},
  {uvToX: (u, v) => -u, uvToY: (u, v) => 1, uvToZ: (u, v) => v},
  {uvToX: (u, v) => -u, uvToY: (u, v) => -v, uvToZ: (u, v) => 1},
  {uvToX: (u, v) => -1, uvToY: (u, v) => -v, uvToZ: (u, v) => -u},
  {uvToX: (u, v) => v, uvToY: (u, v) => -1, uvToZ: (u, v) => -u},
  {uvToX: (u, v) => v, uvToY: (u, v) => u, uvToZ: (u, v) => -1}
];

/**
 * Converts (face, u, v) coordinates to a direction vector (not necessarily unit
 * length).
 *
 * Requires that the face is between 0 and 5, inclusive.
 */
export function faceUvToXyz(face: number, u: number, v: number) {
  const t = faceToXyzTransform(face);
  return new S2Point(t.uvToX(u, v), t.uvToY(u, v), t.uvToZ(u, v));
}

function faceToXyzTransform(face: number) {
  // We map illegal face indices to the largest face index to preserve legacy
  // behavior.
  return XYZ_TRANSFORMS[Math.min(5, face)];
}

/**
 * Converts (face, si, ti) coordinates to a direction vector (not necessarily
 * unit length.)
 */
export function faceSiTiToXyz(face: number, si: number, ti: number) {
  const u = stToUV(siTiToSt(si));
  const v = stToUV(siTiToSt(ti));
  return faceUvToXyz(face, u, v);
}

/**
 * Returns the face containing the given direction vector (for points on the
 * boundary between faces, the result is arbitrary but repeatable.)
 */
function xyzToFace(p: S2Point) {
  const x = p.x, y = p.y, z = p.z;
  switch (S2Point.largestAbsComponent(x, y, z)) {
    case 0:
      return (x < 0) ? 3 : 0;
    case 1:
      return (y < 0) ? 4 : 1;
    default:
      return (z < 0) ? 5 : 2;
  }
}

/**
 * A transform from 3D cartesian coordinates to the 2D coordinates of a face.
 * For (x, y, z) coordinates within the face, the resulting UV coordinates
 * should each lie in the inclusive range [-1,1], with the center of the face
 * along that axis at 0.
 */
interface UvTransform {
  /**
   * Returns the 'u' coordinate of the [u, v] point projected onto a cube face
   * from the given [x, y, z] position.
   */
  xyzToU(x: number, y: number, z: number): number;

  /**
   * Returns the 'v' coordinate of the [u, v] point projected onto a cube face
   * from the given [x, y, z] position.
   */
  xyzToV(x: number, y: number, z: number): number;
}

/**
 * The transforms to convert (x, y, z) coordinates to u and v coordinates on a
 * specific face, indexed by face.
 */
const UV_TRANSFORMS: UvTransform[] = [
  {xyzToU: (x, y, z) => (y / x), xyzToV: (x, y, z) => (z / x)},
  {xyzToU: (x, y, z) => (-x / y), xyzToV: (x, y, z) => (z / y)},
  {xyzToU: (x, y, z) => (-x / z), xyzToV: (x, y, z) => (-y / z)},
  {xyzToU: (x, y, z) => (z / x), xyzToV: (x, y, z) => (y / x)},
  {xyzToU: (x, y, z) => (z / y), xyzToV: (x, y, z) => (-x / y)},
  {xyzToU: (x, y, z) => (-y / z), xyzToV: (x, y, z) => (-x / z)}
];

function uvToST(u: number) {
  if (u >= 0) {
    return 0.5 * Math.sqrt(1 + 3 * u);
  } else {
    return 1 - 0.5 * Math.sqrt(1 - 3 * u);
  }
}

/**
 * Returns the si- or ti-coordinate that is nearest to the given s- or t-value.
 * The result may be outside the range of valid (si,ti)-values.
 */
function stToSiTi(s: number) {
  return Math.round(s * MAX_SITI);
}

class FaceSiTi {
  /**
   * @param face The face on which the position exists.
   * @param si The si coordinate.
   * @param ti The ti coordinate.
   */
  constructor(readonly face: number, readonly si: number, readonly ti: number) {
  }
}

/**
 * Converts a direction vector (not necessarily unit length) to (face, si, ti)
 * coordinates.
 */
export function xyzToFaceSiTi(p: S2Point) {
  const face = xyzToFace(p);
  const t = UV_TRANSFORMS[face];
  const u = t.xyzToU(p.x, p.y, p.z);
  const v = t.xyzToV(p.x, p.y, p.z);
  const si = stToSiTi(uvToST(u));
  const ti = stToSiTi(uvToST(v));
  return new FaceSiTi(face, si, ti);
}

/**
 * Returns the number of consecutive least significant zero bits of the value.
 */
function numberOfTrailingZeros(value: number) {
  // Based on
  // https://github.com/dart-lang/fixnum/blob/master/lib/src/utilities.dart
  let i = (value & -value) - 1;
  i -= (i >> 1) & 0x55555555;
  i = (i & 0x33333333) + ((i >> 2) & 0x33333333);
  i = (i + (i >> 4)) & 0x0F0F0F0F;
  i += i >> 8;
  i += i >> 16;
  i &= 0x0000003F;
  return i & 0x0000003F;
}

/** Returns the level of the given si or ti coordinate. */
function siTiToLevel(siTi: number) {
  const numTrailingZeros = numberOfTrailingZeros(siTi);
  // Capped by 31 because MAX_SITI == 1 << 31.
  return MAX_LEVEL - Math.min(numTrailingZeros, 31);
}

/**
 * If p is exactly a cell center, returns the level of the cell, -1 otherwise.
 */
export function levelIfCenter(fst: FaceSiTi, p: S2Point) {
  // If the levels corresponding to si,ti are not equal, then p is not a cell
  // center. The si,ti values 0 and MAX_SITI need to be handled specially
  // because they do not correspond to cell centers at any valid level; they are
  // mapped to level -1 by the code below.
  const level = siTiToLevel(fst.si);
  if (level < 0 || level !== siTiToLevel(fst.ti)) {
    return -1;
  } else {
    // assert level <= S2CellId.MAX_LEVEL;
    // In infinite precision, this test could be changed to ST == SiTi. However,
    // due to rounding errors, UVtoST(XYZtoFaceUV(FaceUVtoXYZ(STtoUV(...)))) is
    // not idempotent. On the other hand, centerRaw is computed exactly the same
    // way p was originally computed (if it is indeed the center of an S2Cell):
    // the comparison can be exact.
    const center = faceSiTiToXyz(fst.face, fst.si, fst.ti).normalize();
    if (p.equals(center)) {
      return level;
    } else {
      return -1;
    }
  }
}
