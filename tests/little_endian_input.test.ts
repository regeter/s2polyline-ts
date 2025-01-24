import {LittleEndianInput} from '../src/lib/little_endian_input';
import {Long} from '../src/lib/long';

function expectEOF(decoder: LittleEndianInput) {
  expect(() => decoder.readByte()).toThrow();
}

describe('LittleEndianInput', () => {
  it('reads byte', () => {
    const decoder = new LittleEndianInput(new Uint8Array([0, -1]));
    expect(decoder.readByte()).toBe(0);
    expect(decoder.readByte()).toBe(255);
    expectEOF(decoder);
  });

  it('reads bytes', () => {
    const decoder = new LittleEndianInput(new Uint8Array([0, 1, 2, 3, 4, 5]));
    expect(decoder.readBytes(3)).toEqual([0, 1, 2]);
    expect(decoder.readBytes(3)).toEqual([3, 4, 5]);
    expectEOF(decoder);
  });

  it('reads int', () => {
    const decoder =
        new LittleEndianInput(new Uint8Array([0, 0, 0, 0, -1, -1, -1, -1]));
    expect(decoder.readInt()).toBe(0);
    expect(decoder.readInt()).toBe(-1);
    expectEOF(decoder);
  });

  it('reads double', () => {
    const decoder = new LittleEndianInput(new Uint8Array([
      0, 0, 0, 0, 0, 0, 0,  0,   1, 0, 0, 0, 0, 0, 0,   0,
      0, 0, 0, 0, 0, 0, -8, 127, 0, 0, 0, 0, 0, 0, -16, 127
    ]));
    expect(decoder.readDouble()).toBe(0);
    expect(decoder.readDouble()).toBe(Number.MIN_VALUE);
    expect(Number.isNaN(decoder.readDouble())).toBe(true);
    expect(decoder.readDouble()).toBe(Number.POSITIVE_INFINITY);
    expectEOF(decoder);
  });

  it('reads varint32', () => {
    const decoder =
        new LittleEndianInput(new Uint8Array([0, 1, 127, 0xa2, 0x74]));
    expect(decoder.readVarint32()).toBe(0);
    expect(decoder.readVarint32()).toBe(1);
    expect(decoder.readVarint32()).toBe(127);
    // 14882
    expect(decoder.readVarint32()).toBe((0x22 << 0) | (0x74 << 7));
    expectEOF(decoder);
  });

  it('reads varint64', () => {
    const decoder = new LittleEndianInput(new Uint8Array([
      0xbe, 0xf7, 0x92, 0x84, 0x0b, 0xbe, 0xf7, 0x92, 0x84, 0x1b,
      0x80, 0xe6, 0xeb, 0x9c, 0xc3, 0xc9, 0xa4, 0x49, 0x9b, 0xa8,
      0xf9, 0xc2, 0xbb, 0xd6, 0x80, 0x85, 0xa6, 0x01
    ]));
    // 2961488830
    expect(decoder.readVarint64()).toEqual(new Long(2961488830, 0));
    // 7256456126
    expect(decoder.readVarint64()).toEqual(new Long(2961488830, 1));
    // 41256202580718336
    expect(decoder.readVarint64()).toEqual(new Long(865792768, 9605708));
    // 11964378330978735131
    expect(decoder.readVarint64()).toEqual(new Long(3093189659, 2785673907));
    expectEOF(decoder);
  });
});
