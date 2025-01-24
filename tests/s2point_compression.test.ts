import {LittleEndianInput} from '../src/lib/little_endian_input';
import {LittleEndianOutput} from '../src/lib/little_endian_output';
import {MAX_LEVEL} from '../src/lib/s2cell_id';
import {S2Point} from '../src/lib/s2point';
import {decodePointsCompressed, encodePointsCompressed, TEST_ONLY} from '../src/lib/s2point_compression';

const NthDerivativeCoder = TEST_ONLY.NthDerivativeCoder;

describe('NthDerivativeCoder', () => {
  it('returns correct encode/decode', () => {
    const input = [1, 5, 10, 15, 20, 23];
    const order0 = [1, 5, 10, 15, 20, 23];
    const order1 = [1, 4, 5, 5, 5, 3];
    const order2 = [1, 4, 1, 0, 0, -2];

    const encoder0 = new NthDerivativeCoder(0);
    const decoder0 = new NthDerivativeCoder(0);
    const encoder1 = new NthDerivativeCoder(1);
    const decoder1 = new NthDerivativeCoder(1);
    const encoder2 = new NthDerivativeCoder(2);
    const decoder2 = new NthDerivativeCoder(2);
    for (let i = 0; i < input.length; i++) {
      expect(encoder0.encode(input[i])).toBe(order0[i]);
      expect(encoder0.encode(decoder0.decode(order0[i]))).toBe(input[i]);
      expect(encoder1.encode(input[i])).toBe(order1[i]);
      expect(decoder1.decode(order1[i])).toBe(input[i]);
      expect(encoder2.encode(input[i])).toBe(order2[i]);
      expect(decoder2.decode(order2[i])).toBe(input[i]);
    }
  });
});

describe('encodePointsCompressed and decodePointsCompressed', () => {
  it('return correct rount-trip encode/decode', () => {
    const vertices: S2Point[] = [
      new S2Point(0, 0, 1),
      new S2Point(0, 1, 0),
      new S2Point(1, 0, 0),
      new S2Point(-1, 0, 0),
      new S2Point(0, -1, 0),
      new S2Point(0, 0, -1),
    ];
    const encoder = new LittleEndianOutput();
    encodePointsCompressed(vertices, MAX_LEVEL, encoder);
    const bytes = encoder.getArray();

    const decoder = new LittleEndianInput(bytes);
    expect(decodePointsCompressed(vertices.length, MAX_LEVEL, decoder))
        .toEqual(vertices);
  });
});
