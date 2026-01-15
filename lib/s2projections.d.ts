import { S2Point } from './s2point';
/**
 * The maximum value of an si- or ti-coordinate. The range of valid (si,ti)
 * values is [0..MAX_SITI].
 */
export declare const MAX_SITI: number;
/**
 * Converts an s- or t-value to the corresponding u- or v-value. This is a
 * non-linear transformation from [-1,1] to [-1,1] that attempts to make the
 * cell sizes more uniform.
 */
export declare function stToUV(s: number): number;
/**
 * Converts (face, u, v) coordinates to a direction vector (not necessarily unit
 * length).
 *
 * Requires that the face is between 0 and 5, inclusive.
 */
export declare function faceUvToXyz(face: number, u: number, v: number): S2Point;
/**
 * Converts (face, si, ti) coordinates to a direction vector (not necessarily
 * unit length.)
 */
export declare function faceSiTiToXyz(face: number, si: number, ti: number): S2Point;
declare class FaceSiTi {
    readonly face: number;
    readonly si: number;
    readonly ti: number;
    /**
     * @param face The face on which the position exists.
     * @param si The si coordinate.
     * @param ti The ti coordinate.
     */
    constructor(face: number, si: number, ti: number);
}
/**
 * Converts a direction vector (not necessarily unit length) to (face, si, ti)
 * coordinates.
 */
export declare function xyzToFaceSiTi(p: S2Point): FaceSiTi;
/**
 * If p is exactly a cell center, returns the level of the cell, -1 otherwise.
 */
export declare function levelIfCenter(fst: FaceSiTi, p: S2Point): number;
export {};
