import { S2Point } from './s2point';
/**
 * This class represents a point on the unit sphere as a pair of
 * latitude-longitude coordinates.
 */
export declare class S2LatLng {
    private readonly latRadians;
    readonly lngRadians: number;
    private constructor();
    /** Converts a point (not necessarily normalized) to an S2LatLng. */
    static fromPoint(p: S2Point): S2LatLng;
    /**
     * Converts an S2LatLng to the equivalent unit-length vector (S2Point).
     */
    toPoint(): S2Point;
    /** Returns a new S2LatLng converted from degrees. */
    static fromDegrees(latDegrees: number, lngDegrees: number): S2LatLng;
    /** Returns the latitude of this point as degrees. */
    latDegrees(): number;
    /** Returns the longitude of this point as degrees. */
    lngDegrees(): number;
}
