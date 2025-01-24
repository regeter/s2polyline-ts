import {decodeZigZag32, deinterleaveBits1, deinterleaveBits2, encodeZigZag32, interleaveBits} from '../src/lib/encoded_ints';
import {Long} from '../src/lib/long';

describe('encodeZigZag32', () => {
  it('returns a correct number', () => {
    expect(encodeZigZag32(0)).toBe(0);
    expect(encodeZigZag32(-1)).toBe(1);
    expect(encodeZigZag32(1)).toBe(2);
    expect(encodeZigZag32(-2)).toBe(3);
    expect(encodeZigZag32(0x3FFFFFFF)).toBe(0x7FFFFFFE | 0);
    expect(encodeZigZag32(0xC0000000)).toBe(0x7FFFFFFF | 0);
    expect(encodeZigZag32(0x7FFFFFFF)).toBe(0xFFFFFFFE | 0);
    expect(encodeZigZag32(0x80000000)).toBe(0xFFFFFFFF | 0);
  });
});

describe('decodeZigZag32', () => {
  it('returns a correct number', () => {
    expect(decodeZigZag32(0)).toBe(0);
    expect(decodeZigZag32(1)).toBe(-1);
    expect(decodeZigZag32(2)).toBe(1);
    expect(decodeZigZag32(3)).toBe(-2);
    expect(decodeZigZag32(0x7FFFFFFE)).toBe(0x3FFFFFFF | 0);
    expect(decodeZigZag32(0x7FFFFFFF)).toBe(0xC0000000 | 0);
    expect(decodeZigZag32(0xFFFFFFFE)).toBe(0x7FFFFFFF | 0);
    expect(decodeZigZag32(0xFFFFFFFF)).toBe(0x80000000 | 0);
  });
});

describe('encodeZigZag32 and decodeZigZag32', () => {
  it('returns a correct number in a round trip', () => {
    expect(encodeZigZag32(decodeZigZag32(0))).toBe(0);
    expect(encodeZigZag32(decodeZigZag32(1))).toBe(1);
    expect(encodeZigZag32(decodeZigZag32(-1))).toBe(-1);
    expect(encodeZigZag32(decodeZigZag32(14927))).toBe(14927);
    expect(encodeZigZag32(decodeZigZag32(-3612))).toBe(-3612);
  });
});

function checkInterleaveBits(
    lowBits: number, highBits: number, v1: number, v2: number) {
  const interleaved = new Long(lowBits, highBits);
  expect(interleaveBits(v1, v2)).toEqual(interleaved);
  expect(deinterleaveBits1(interleaved)).toBe(v1 | 0);
  expect(deinterleaveBits2(interleaved)).toBe(v2 | 0);
}

describe('interleaveBits and deinterleaveBits1/2', () => {
  it('return a correct number', () => {
    checkInterleaveBits(0x00000000, 0xC0000000, 0x80000000, 0x80000000);
    checkInterleaveBits(0x2AAAAA88, 0xEAAAAAAA, 0x80000000, 0xFFFF7FFA);
    checkInterleaveBits(0xAAAAA8AA, 0xEAAAAAAA, 0x80000000, 0xFFFFFFEF);
    checkInterleaveBits(0xAAAAAAAA, 0xEAAAAAAA, 0x80000000, 0xFFFFFFFF);
    checkInterleaveBits(0x00000000, 0x40000000, 0x80000000, 0x00000000);
    checkInterleaveBits(0x000000A8, 0x40000000, 0x80000000, 0x0000000E);
    checkInterleaveBits(0xAAAAAA22, 0x6AAAAAAA, 0x80000000, 0x7FFFFFF5);
    checkInterleaveBits(0x15555544, 0xD5555555, 0xFFFF7FFA, 0x80000000);
    checkInterleaveBits(0x3FFFFFCC, 0xFFFFFFFF, 0xFFFF7FFA, 0xFFFF7FFA);
    checkInterleaveBits(0xBFFFFDEE, 0xFFFFFFFF, 0xFFFF7FFA, 0xFFFFFFEF);
    checkInterleaveBits(0xBFFFFFEE, 0xFFFFFFFF, 0xFFFF7FFA, 0xFFFFFFFF);
    checkInterleaveBits(0x15555544, 0x55555555, 0xFFFF7FFA, 0x00000000);
    checkInterleaveBits(0x155555EC, 0x55555555, 0xFFFF7FFA, 0x0000000E);
    checkInterleaveBits(0xBFFFFF66, 0x7FFFFFFF, 0xFFFF7FFA, 0x7FFFFFF5);
    checkInterleaveBits(0x55555455, 0xD5555555, 0xFFFFFFEF, 0x80000000);
    checkInterleaveBits(0x7FFFFEDD, 0xFFFFFFFF, 0xFFFFFFEF, 0xFFFF7FFA);
    checkInterleaveBits(0xFFFFFCFF, 0xFFFFFFFF, 0xFFFFFFEF, 0xFFFFFFEF);
    checkInterleaveBits(0xFFFFFEFF, 0xFFFFFFFF, 0xFFFFFFEF, 0xFFFFFFFF);
    checkInterleaveBits(0x55555455, 0x55555555, 0xFFFFFFEF, 0x00000000);
    checkInterleaveBits(0x555554FD, 0x55555555, 0xFFFFFFEF, 0x0000000E);
    checkInterleaveBits(0xFFFFFE77, 0x7FFFFFFF, 0xFFFFFFEF, 0x7FFFFFF5);
    checkInterleaveBits(0x55555555, 0xD5555555, 0xFFFFFFFF, 0x80000000);
    checkInterleaveBits(0x7FFFFFDD, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFF7FFA);
    checkInterleaveBits(0xFFFFFDFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFEF);
    checkInterleaveBits(0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF);
    checkInterleaveBits(0x55555555, 0x55555555, 0xFFFFFFFF, 0x00000000);
    checkInterleaveBits(0x555555FD, 0x55555555, 0xFFFFFFFF, 0x0000000E);
    checkInterleaveBits(0xFFFFFF77, 0x7FFFFFFF, 0xFFFFFFFF, 0x7FFFFFF5);
    checkInterleaveBits(0x00000000, 0x80000000, 0x00000000, 0x80000000);
    checkInterleaveBits(0x2AAAAA88, 0xAAAAAAAA, 0x00000000, 0xFFFF7FFA);
    checkInterleaveBits(0xAAAAA8AA, 0xAAAAAAAA, 0x00000000, 0xFFFFFFEF);
    checkInterleaveBits(0xAAAAAAAA, 0xAAAAAAAA, 0x00000000, 0xFFFFFFFF);
    checkInterleaveBits(0x00000000, 0x00000000, 0x00000000, 0x00000000);
    checkInterleaveBits(0x000000A8, 0x00000000, 0x00000000, 0x0000000E);
    checkInterleaveBits(0xAAAAAA22, 0x2AAAAAAA, 0x00000000, 0x7FFFFFF5);
    checkInterleaveBits(0x00000054, 0x80000000, 0x0000000E, 0x80000000);
    checkInterleaveBits(0x2AAAAADC, 0xAAAAAAAA, 0x0000000E, 0xFFFF7FFA);
    checkInterleaveBits(0xAAAAA8FE, 0xAAAAAAAA, 0x0000000E, 0xFFFFFFEF);
    checkInterleaveBits(0xAAAAAAFE, 0xAAAAAAAA, 0x0000000E, 0xFFFFFFFF);
    checkInterleaveBits(0x00000054, 0x00000000, 0x0000000E, 0x00000000);
    checkInterleaveBits(0x000000FC, 0x00000000, 0x0000000E, 0x0000000E);
    checkInterleaveBits(0xAAAAAA76, 0x2AAAAAAA, 0x0000000E, 0x7FFFFFF5);
    checkInterleaveBits(0x55555511, 0x95555555, 0x7FFFFFF5, 0x80000000);
    checkInterleaveBits(0x7FFFFF99, 0xBFFFFFFF, 0x7FFFFFF5, 0xFFFF7FFA);
    checkInterleaveBits(0xFFFFFDBB, 0xBFFFFFFF, 0x7FFFFFF5, 0xFFFFFFEF);
    checkInterleaveBits(0xFFFFFFBB, 0xBFFFFFFF, 0x7FFFFFF5, 0xFFFFFFFF);
    checkInterleaveBits(0x55555511, 0x15555555, 0x7FFFFFF5, 0x00000000);
    checkInterleaveBits(0x555555B9, 0x15555555, 0x7FFFFFF5, 0x0000000E);
    checkInterleaveBits(0xFFFFFF33, 0x3FFFFFFF, 0x7FFFFFF5, 0x7FFFFFF5);
  });
});
