"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decode = exports.encode = exports.S2Polyline = exports.S2Point = exports.S2LatLng = void 0;
var s2latlng_1 = require("./lib/s2latlng");
Object.defineProperty(exports, "S2LatLng", { enumerable: true, get: function () { return s2latlng_1.S2LatLng; } });
var s2point_1 = require("./lib/s2point");
Object.defineProperty(exports, "S2Point", { enumerable: true, get: function () { return s2point_1.S2Point; } });
var s2polyline_1 = require("./lib/s2polyline");
Object.defineProperty(exports, "S2Polyline", { enumerable: true, get: function () { return s2polyline_1.S2Polyline; } });
const s2latlng_2 = require("./lib/s2latlng");
const s2polyline_2 = require("./lib/s2polyline");
function encode(latlngs) {
    const vertices = latlngs.map(ll => ll.toPoint());
    const polyline = new s2polyline_2.S2Polyline(vertices);
    const bytes = polyline.encodeCompact();
    return btoa(String.fromCharCode(...bytes))
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}
exports.encode = encode;
function decode(encoded) {
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const polyline = s2polyline_2.S2Polyline.decode(bytes);
    return polyline.vertices.map(p => s2latlng_2.S2LatLng.fromPoint(p));
}
exports.decode = decode;
