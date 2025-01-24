# s2polyline-ts

[![npm version](https://badge.fury.io/js/s2polyline-ts.svg)](https://badge.fury.io/js/s2polyline-ts)

Encoding/decoding S2 polylines for JavaScript. This library is a TypeScript port of the S2 Geometry Library's polyline encoding/decoding functionality.

## Overview

This package provides utilities for manipulating geometric shapes on a sphere, making it suitable for working with geographic data. It's based on the S2 Geometry Library, which is designed for spherical geometry rather than planar 2D maps.

This library specifically focuses on encoding and decoding S2 polylines, which are sequences of points on the sphere represented in a compact, encoded format.

## Installation

```bash
npm install s2polyline-ts
```

## Usage

```typescript
import { encode, decode } from 's2polyline-ts';
import { S2LatLng } from 's2polyline-ts';

// Encoding
const coordinates: S2LatLng[] = [
    S2LatLng.fromDegrees(37.7749, -122.4194), // San Francisco
    S2LatLng.fromDegrees(40.7128, -74.0060),  // New York
    S2LatLng.fromDegrees(34.0522, -118.2437)  // Los Angeles
];
console.log("Encoding::", coordinates);
const encoded: string = encode(coordinates);
console.log("Encoded::", encoded);

// Decoding
const encodedPolyline = 'AhoGJjx2y008lAIA1rLcAaXivALU9BzoKYu8cgA';
const decoded = decode(encodedPolyline);
console.log("Decoded::", decoded);
```

## API Reference

*   **`encode(coordinates: S2LatLng[]): string`**: Encodes an array of `S2LatLng` objects into an S2 encoded polyline string.
*   **`decode(encodedPolyline: string): S2LatLng[]`**: Decodes an S2 encoded polyline string into an array of `S2LatLng` objects.
* **`S2LatLng`** class for representing a latitude and longitude
    * **`S2LatLng.fromDegrees(latDegrees: number, lngDegrees: number)`:** Create from degrees

## Contributing

Contributions are welcome! Please see the [GitHub repository](https://github.com/regeter/s2polyline-ts) for issues and pull requests.

## License

Apache 2.0

## Credits

This library is based on the [S2 Geometry Library](https://github.com/google/s2geometry).
Initial code created by Sukolsak Sakshuwong.

## Disclaimer

This is not an official Google product.