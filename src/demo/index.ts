import { S2LatLng } from '../lib/s2latlng';
import { S2Point } from '../lib/s2point';
import { S2Polyline } from '../lib/s2polyline';

function base64Encode(bytes: Uint8Array) {
  let byteString = '';
  for (let i = 0; i < bytes.length; i++) {
    byteString += String.fromCharCode(bytes[i]);
  }
  return btoa(byteString);
}

function base64Decode(base64: string) {
  const byteString = atob(base64);
  const bytes = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    bytes[i] = byteString.charCodeAt(i);
  }
  return bytes;
}

function encodePath(latlngs: S2LatLng[]) {
  const vertices: S2Point[] = [];
  for (const latLng of latlngs) {
    vertices.push(latLng.toPoint());
  }
  const polyline = new S2Polyline(vertices);
  const bytes = polyline.encodeCompact();
  return base64Encode(bytes).replace(/\+/g, '-').replace(/\//g, '_');
}

function decodePath(base64: string) {
  const bytes = base64Decode(base64.replace(/-/g, '+').replace(/_/g, '/'));
  const polyline = S2Polyline.decode(bytes);
  const latlngs: S2LatLng[] = [];
  for (const p of polyline.vertices) {
    latlngs.push(S2LatLng.fromPoint(p));
  }
  return latlngs;
}

const button = document.getElementById('decode');
const s2Input = document.getElementById('s2polyline') as HTMLInputElement;
const resultPre = document.getElementById('result') as HTMLPreElement;
if (button) {
  button.onclick = () => {
    let latLngs: S2LatLng[];
    try {
      latLngs = decodePath(s2Input.value);
    } catch (e: unknown) {
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