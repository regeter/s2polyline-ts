import { decodeGMP, parseInput } from '../src/demo/utils';

describe('utils', () => {
    describe('decodeGMP', () => {
        it('decodes a simple (0,0)-(1,1) GMP polyline', () => {
            const encoded = '??_ibE_ibE';
            const path = decodeGMP(encoded);
            expect(path.length).toBe(2);
            expect(path[0].latDegrees()).toBe(0);
            expect(path[0].lngDegrees()).toBe(0);
            expect(path[1].latDegrees()).toBe(1);
            expect(path[1].lngDegrees()).toBe(1);
        });
    });

    describe('parseInput', () => {
        it('parses JSON format', () => {
            const input = '[{"latitude": 52.5163, "longitude": 13.2399}, {"lat": 52.5162, "lng": 13.2400}]';
            const path = parseInput(input);
            expect(path.length).toBe(2);
            expect(path[0].latDegrees()).toBeCloseTo(52.5163, 5);
            expect(path[1].lngDegrees()).toBeCloseTo(13.2400, 5);
        });

        it('parses Lat,Lng pairs', () => {
            const input = '52.5163, 13.2399\n52.5162 13.2400';
            const path = parseInput(input);
            expect(path.length).toBe(2);
            expect(path[0].latDegrees()).toBeCloseTo(52.5163, 5);
            expect(path[1].lngDegrees()).toBeCloseTo(13.2400, 5);
        });

        it('parses loose JSON format (unquoted keys, missing brackets, descriptive names)', () => {
            const input = '{ latitude: 52.5163, longitude: 13.2399 }, { latitude: 52.5162, longitude: 13.2400 }';
            const path = parseInput(input);
            expect(path.length).toBe(2);
            expect(path[0].latDegrees()).toBeCloseTo(52.5163, 5);
            expect(path[1].lngDegrees()).toBeCloseTo(13.2400, 5);
        });

        it('parses JSON array with unquoted keys and descriptive names', () => {
            const input = '[{ latitude: 52.5163, longitude: 13.2399 }, { latitude: 52.5162, longitude: 13.2400 }]';
            const path = parseInput(input);
            expect(path.length).toBe(2);
            expect(path[0].latDegrees()).toBeCloseTo(52.5163, 5);
            expect(path[1].lngDegrees()).toBeCloseTo(13.2400, 5);
        });

        it('parses GMP encoded string', () => {
            const input = '??_ibE_ibE';
            const path = parseInput(input);
            expect(path.length).toBe(2);
            expect(path[0].latDegrees()).toBe(0);
            expect(path[1].latDegrees()).toBe(1);
        });
    });
});
