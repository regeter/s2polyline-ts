import { S2LatLng } from '../lib/s2latlng';

export function decodeGMP(encoded: string): S2LatLng[] {
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;
  const path: S2LatLng[] = [];

  while (index < len) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    path.push(S2LatLng.fromDegrees(lat * 1e-5, lng * 1e-5));
  }
  return path;
}

export function parseInput(input: string): S2LatLng[] {
  const trimmed = input.trim();
  if (!trimmed) return [];

  // Try parsing as GMP polyline (contains characters like _, ~, @, etc.)
  // Simple heuristic: if it's a single line and looks like an encoded string
  if (!trimmed.includes('\n') && !trimmed.includes(',') && !trimmed.includes('{') && !trimmed.includes('[') && !trimmed.includes(':')) {
    try {
      return decodeGMP(trimmed);
    } catch (e) {
      // Fall through
    }
  }

  // Robust parsing for various JSON-like or object-like formats
  // This handles [{lat: 1, lng: 2}], {latitude: 1, longitude: 2}, etc.
  // It also works for objects without brackets or quotes.
  const path: S2LatLng[] = [];

  // Try to find all object-like structures: { ... }
  const objectRegex = /\{[^{}]+\}/g;
  const objectMatches = trimmed.match(objectRegex);

  if (objectMatches) {
    for (const match of objectMatches) {
      const latMatch = match.match(/(?:"?latitude"?|"?lat"?)\s*[:=]\s*([0-9.-]+)/i);
      const lngMatch = match.match(/(?:"?longitude"?|"?lng"?)\s*[:=]\s*([0-9.-]+)/i);
      if (latMatch && lngMatch) {
        const lat = parseFloat(latMatch[1]);
        const lng = parseFloat(lngMatch[1]);
        if (!isNaN(lat) && !isNaN(lng)) {
          path.push(S2LatLng.fromDegrees(lat, lng));
        }
      }
    }
  }

  // If no object-like structures found, try parsing as Lat, Lng pairs (CSV/TSV style)
  if (path.length === 0) {
    const lines = trimmed.split(/\r?\n/);
    for (const line of lines) {
      // Skip lines that look like parts of an object but didn't match the object regex
      if (line.includes('{') || line.includes('}')) continue;

      const parts = line.split(/[, \t]+/).filter(p => p.length > 0);
      if (parts.length >= 2) {
        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);
        if (!isNaN(lat) && !isNaN(lng)) {
          path.push(S2LatLng.fromDegrees(lat, lng));
        }
      }
    }
  }

  if (path.length > 0) return path;

  // Last ditch effort: if it's a single line, maybe it's just a GMP polyline despite characters
  if (!trimmed.includes('\n')) {
    try {
      return decodeGMP(trimmed);
    } catch (e) { }
  }

  throw new Error('Could not parse input. Supported formats: GMP encoded string, JSON array, or Lat,Lng pairs.');
}
