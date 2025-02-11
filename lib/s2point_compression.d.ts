import { LittleEndianInput } from './little_endian_input';
import { LittleEndianOutput } from './little_endian_output';
import { S2Point } from './s2point';
declare class NthDerivativeCoder {
    /** The range of supported Ns is [N_MIN, N_MAX]. */
    private static readonly N_MIN;
    private static readonly N_MAX;
    /** The derivative order of the coder (the N in NthDerivative). */
    private readonly n;
    /** The derivative order in which to code the next value (ramps up to n). */
    private m;
    /** Value memory, from oldest to newest. */
    private readonly memory;
    constructor(n: number);
    encode(k: number): number;
    decode(k: number): number;
    reset(): void;
}
/**
 * Encodes a list of points into an efficient, lossless binary representation,
 * which can be decoded by calling {@link decodePointsCompressed}. The encoding
 * is byte-compatible with the C++ version of the S2 library.
 *
 * Points that are snapped to the specified level will require approximately 4
 * bytes per point, while other points will require 24 bytes per point.
 */
export declare function encodePointsCompressed(points: readonly S2Point[], level: number, encoder: LittleEndianOutput): void;
/**
 * Decodes a list of points that were encoded using {@link
 * encodePointsCompressed}.
 *
 * Points that are snapped to the specified level will require approximately 4
 * bytes per point, while other points will require 24 bytes per point.
 */
export declare function decodePointsCompressed(numVertices: number, level: number, decoder: LittleEndianInput): S2Point[];
export declare const TEST_ONLY: {
    NthDerivativeCoder: typeof NthDerivativeCoder;
};
export {};
