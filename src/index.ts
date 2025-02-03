export { S2LatLng } from './lib/s2latlng';
export { S2Point } from './lib/s2point';
export { S2Polyline } from './lib/s2polyline';

import { S2LatLng } from './lib/s2latlng';
import { S2Point } from './lib/s2point';
import { S2Polyline } from './lib/s2polyline';

export function encode(latlngs: S2LatLng[]): string {
  const vertices: S2Point[] = latlngs.map(ll => ll.toPoint());
  const polyline = new S2Polyline(vertices);
  const bytes = polyline.encodeCompact();
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export function decode(encoded: string): S2LatLng[] {
  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  const polyline = S2Polyline.decode(bytes);
  return polyline.vertices.map(p => S2LatLng.fromPoint(p));
}
