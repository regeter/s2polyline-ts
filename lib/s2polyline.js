"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.S2Polyline = void 0;
const little_endian_input_1 = require("./little_endian_input");
const little_endian_output_1 = require("./little_endian_output");
const s2cell_id_1 = require("./s2cell_id");
const s2point_1 = require("./s2point");
const s2point_compression_1 = require("./s2point_compression");
const s2projections_1 = require("./s2projections");
const LOSSLESS_ENCODING_VERSION = 1;
const COMPRESSED_ENCODING_VERSION = 2;
/**
 * An S2Polyline represents a sequence of zero or more vertices connected by
 * straight edges (geodesics). Edges of length 0 and 180 degrees are not
 * allowed, i.e. adjacent vertices should not be identical or antipodal.
 */
class S2Polyline {
    constructor(vertices) {
        this.vertices = vertices;
    }
    /**
     * Computes the level at which most of the vertices are snapped. If multiple
     * levels have the same maximum number of vertices snapped to it, the first
     * one (lowest level number / largest area / smallest encoding length) will be
     * chosen, so this is desired. Returns -1 for unsnapped polylines.
     */
    getBestSnapLevel() {
        const histogram = Array.from({ length: s2cell_id_1.MAX_LEVEL + 1 }).fill(0);
        for (const p of this.vertices) {
            const faceSiTi = (0, s2projections_1.xyzToFaceSiTi)(p);
            const level = (0, s2projections_1.levelIfCenter)(faceSiTi, p);
            // Level is -1 for unsnapped points.
            if (level >= 0) {
                histogram[level]++;
            }
        }
        let snapLevel = 0;
        for (let i = 1; i < histogram.length; i++) {
            if (histogram[i] > histogram[snapLevel]) {
                snapLevel = i;
            }
        }
        if (histogram[snapLevel] === 0 && this.vertices.length > 0) {
            // This is an unsnapped polyline.
            return -1;
        }
        return snapLevel;
    }
    /**
     * Encodes the polyline into an efficient, lossless binary representation,
     * which can be decoded by calling {@link S2Polyline#decode}. The encoding is
     * byte-compatible with the C++ version of the S2 library.
     */
    encodeCompact() {
        const numVertices = this.vertices.length;
        const level = numVertices === 0 ? s2cell_id_1.MAX_LEVEL : this.getBestSnapLevel();
        const encoder = new little_endian_output_1.LittleEndianOutput();
        if (level === -1) {
            this.encodeUncompressed(encoder);
        }
        else {
            this.encodeCompressed(level, encoder);
        }
        return encoder.getArray();
    }
    /** Encodes this polyline into the given little endian output stream. */
    encodeUncompressed(encoder) {
        encoder.writeByte(LOSSLESS_ENCODING_VERSION);
        encoder.writeInt(this.vertices.length);
        for (const p of this.vertices) {
            p.encode(encoder);
        }
    }
    /** Encodes a compressed polyline at requested snap level. */
    encodeCompressed(snapLevel, encoder) {
        encoder.writeByte(COMPRESSED_ENCODING_VERSION);
        encoder.writeByte(snapLevel);
        encoder.writeVarint32(this.vertices.length);
        (0, s2point_compression_1.encodePointsCompressed)(this.vertices, snapLevel, encoder);
    }
    static decode(bytes) {
        const decoder = new little_endian_input_1.LittleEndianInput(bytes);
        const version = decoder.readByte();
        if (version === LOSSLESS_ENCODING_VERSION) {
            return S2Polyline.decodeLossless(decoder);
        }
        else if (version === COMPRESSED_ENCODING_VERSION) {
            return S2Polyline.decodeCompressed(decoder);
        }
        else {
            throw new Error(`Unsupported S2Polyline encoding version ${version}`);
        }
    }
    static decodeLossless(decoder) {
        const vertices = [];
        const numVertices = decoder.readInt();
        for (let i = 0; i < numVertices; i++) {
            vertices.push(s2point_1.S2Point.decode(decoder));
        }
        return new S2Polyline(vertices);
    }
    static decodeCompressed(decoder) {
        const level = decoder.readByte();
        if (level > s2cell_id_1.MAX_LEVEL) {
            throw new Error(`Invalid level ${level}`);
        }
        const numVertices = decoder.readVarint32();
        const vertices = (0, s2point_compression_1.decodePointsCompressed)(numVertices, level, decoder);
        return new S2Polyline(vertices);
    }
}
exports.S2Polyline = S2Polyline;
