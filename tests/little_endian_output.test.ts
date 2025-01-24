import {LittleEndianOutput} from '../src/lib/little_endian_output';
import {Long} from '../src/lib/long';

describe('LittleEndianOutput', () => {
  it('writes byte', () => {
    const encoder = new LittleEndianOutput();
    encoder.writeByte(0x00);
    encoder.writeByte(0xFF);
    expect(encoder.getArray()).toEqual(new Uint8Array([0, -1]));
  });

  it('writes bytes', () => {
    const encoder = new LittleEndianOutput();
    encoder.writeBytes([0, 1, 2]);
    encoder.writeBytes([3, 4, 5]);
    expect(encoder.getArray()).toEqual(new Uint8Array([0, 1, 2, 3, 4, 5]));
  });

  it('writes double', () => {
    const encoder = new LittleEndianOutput();
    encoder.writeDouble(0);
    encoder.writeDouble(Number.MIN_VALUE);
    encoder.writeDouble(Number.NaN);
    encoder.writeDouble(Number.POSITIVE_INFINITY);
    expect(encoder.getArray()).toEqual(new Uint8Array([
      0, 0, 0, 0, 0, 0, 0,  0,   1, 0, 0, 0, 0, 0, 0,   0,
      0, 0, 0, 0, 0, 0, -8, 127, 0, 0, 0, 0, 0, 0, -16, 127
    ]));
  });

  it('writes varint32', () => {
    const encoder = new LittleEndianOutput();
    encoder.writeVarint32(0);
    encoder.writeVarint32(1);
    encoder.writeVarint32(127);
    encoder.writeVarint32((0x22 << 0) | (0x74 << 7));
    expect(encoder.getArray()).toEqual(new Uint8Array([0, 1, 127, 0xa2, 0x74]));
  });

  it('writes varint64', () => {
    const encoder = new LittleEndianOutput();
    // 2961488830
    encoder.writeVarint64(new Long(2961488830, 0));
    // 7256456126
    encoder.writeVarint64(new Long(2961488830, 1));
    // 41256202580718336
    encoder.writeVarint64(new Long(865792768, 9605708));
    // 11964378330978735131
    encoder.writeVarint64(new Long(3093189659, 2785673907));
    expect(encoder.getArray()).toEqual(new Uint8Array([
      0xbe, 0xf7, 0x92, 0x84, 0x0b, 0xbe, 0xf7, 0x92, 0x84, 0x1b,
      0x80, 0xe6, 0xeb, 0x9c, 0xc3, 0xc9, 0xa4, 0x49, 0x9b, 0xa8,
      0xf9, 0xc2, 0xbb, 0xd6, 0x80, 0x85, 0xa6, 0x01
    ]));
  });
});
