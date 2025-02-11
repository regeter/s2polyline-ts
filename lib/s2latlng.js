"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.S2LatLng = void 0;
const s2point_1 = require("./s2point");
/**
 * This class represents a point on the unit sphere as a pair of
 * latitude-longitude coordinates.
 */
class S2LatLng {
    constructor(latRadians, lngRadians) {
        this.latRadians = latRadians;
        this.lngRadians = lngRadians;
    }
    /** Converts a point (not necessarily normalized) to an S2LatLng. */
    static fromPoint(p) {
        // The "+ 0" is to ensure that points with coordinates of -0.0 and +0.0
        // (which compare equal) are converted to identical S2LatLng values, since
        // even though -0.0 == +0.0 they can be formatted differently.
        const latRadians = Math.atan2(p.z + 0, Math.sqrt(p.x * p.x + p.y * p.y));
        const lngRadians = Math.atan2(p.y + 0, p.x + 0);
        // The latitude and longitude are already normalized. We use atan2 to
        // compute the latitude because the input vector is not necessarily unit
        // length, and atan2 is much more accurate than asin near the poles. Note
        // that atan2(0, 0) is defined to be zero.
        return new S2LatLng(latRadians, lngRadians);
    }
    /**
     * Converts an S2LatLng to the equivalent unit-length vector (S2Point).
     */
    toPoint() {
        const phi = this.latRadians;
        const theta = this.lngRadians;
        const cosphi = Math.cos(phi);
        return new s2point_1.S2Point(Math.cos(theta) * cosphi, Math.sin(theta) * cosphi, Math.sin(phi));
    }
    /** Returns a new S2LatLng converted from degrees. */
    static fromDegrees(latDegrees, lngDegrees) {
        const latRadians = latDegrees * Math.PI / 180;
        const lngRadians = lngDegrees * Math.PI / 180;
        return new S2LatLng(latRadians, lngRadians);
    }
    /** Returns the latitude of this point as degrees. */
    latDegrees() {
        return 180 / Math.PI * this.latRadians;
    }
    /** Returns the longitude of this point as degrees. */
    lngDegrees() {
        return 180 / Math.PI * this.lngRadians;
    }
}
exports.S2LatLng = S2LatLng;
