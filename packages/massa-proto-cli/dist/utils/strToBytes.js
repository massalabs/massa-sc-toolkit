"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strToBytes = void 0;
/**
 * Convert string to bytes
 *
 * @param str - string to convert
 * @returns the converted string as an Uint8Array
 */
function strToBytes(str) {
    if (!str.length) {
        return new Uint8Array(0);
    }
    return new Uint8Array(Buffer.from(str, 'utf-8'));
}
exports.strToBytes = strToBytes;
//# sourceMappingURL=strToBytes.js.map