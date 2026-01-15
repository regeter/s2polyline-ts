export { S2LatLng } from './lib/s2latlng';
export { S2Point } from './lib/s2point';
export { S2Polyline } from './lib/s2polyline';
import { S2LatLng } from './lib/s2latlng';
export declare function encode(latlngs: S2LatLng[]): string;
export declare function decode(encoded: string): S2LatLng[];
