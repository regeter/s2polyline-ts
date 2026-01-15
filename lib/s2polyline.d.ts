import { S2Point } from './s2point';
/**
 * An S2Polyline represents a sequence of zero or more vertices connected by
 * straight edges (geodesics). Edges of length 0 and 180 degrees are not
 * allowed, i.e. adjacent vertices should not be identical or antipodal.
 */
export declare class S2Polyline {
    readonly vertices: readonly S2Point[];
    constructor(vertices: readonly S2Point[]);
    /**
     * Computes the level at which most of the vertices are snapped. If multiple
     * levels have the same maximum number of vertices snapped to it, the first
     * one (lowest level number / largest area / smallest encoding length) will be
     * chosen, so this is desired. Returns -1 for unsnapped polylines.
     */
    private getBestSnapLevel;
    /**
     * Encodes the polyline into an efficient, lossless binary representation,
     * which can be decoded by calling {@link S2Polyline#decode}. The encoding is
     * byte-compatible with the C++ version of the S2 library.
     */
    encodeCompact(): Uint8Array;
    /** Encodes this polyline into the given little endian output stream. */
    private encodeUncompressed;
    /** Encodes a compressed polyline at requested snap level. */
    private encodeCompressed;
    static decode(bytes: Uint8Array): S2Polyline;
    private static decodeLossless;
    private static decodeCompressed;
}
