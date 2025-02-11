"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const s2latlng_1 = require("../lib/s2latlng");
const s2polyline_1 = require("../lib/s2polyline");
function base64Encode(bytes) {
    let byteString = '';
    for (let i = 0; i < bytes.length; i++) {
        byteString += String.fromCharCode(bytes[i]);
    }
    return btoa(byteString);
}
function base64Decode(base64) {
    const byteString = atob(base64);
    const bytes = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
        bytes[i] = byteString.charCodeAt(i);
    }
    return bytes;
}
function encodePath(latlngs) {
    const vertices = [];
    for (const latLng of latlngs) {
        vertices.push(latLng.toPoint());
    }
    const polyline = new s2polyline_1.S2Polyline(vertices);
    const bytes = polyline.encodeCompact();
    return base64Encode(bytes).replace(/\+/g, '-').replace(/\//g, '_');
}
function decodePath(base64) {
    const bytes = base64Decode(base64.replace(/-/g, '+').replace(/_/g, '/'));
    const polyline = s2polyline_1.S2Polyline.decode(bytes);
    const latlngs = [];
    for (const p of polyline.vertices) {
        latlngs.push(s2latlng_1.S2LatLng.fromPoint(p));
    }
    return latlngs;
}
const button = document.getElementById('decode');
const s2Input = document.getElementById('s2polyline');
const resultPre = document.getElementById('result');
if (button) {
    button.onclick = () => {
        let latLngs;
        try {
            latLngs = decodePath(s2Input.value);
        }
        catch (e) {
            alert(e);
            console.error(e);
            return;
        }
        let result = '';
        result += `Number of decoded vertices: ${latLngs.length}\n`;
        for (let i = 0; i < latLngs.length; i++) {
            const latLng = latLngs[i];
            result += `${i}: ${latLng.latDegrees()}, ${latLng.lngDegrees()}\n`;
        }
        resultPre.textContent = result;
    };
}
