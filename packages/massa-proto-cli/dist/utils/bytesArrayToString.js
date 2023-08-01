"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bytesArrayToString = void 0;
/**
 * Converts any Uint8Array to string
 *
 * @param bytesArray - Uint8Array to convert
 *
 * @returns The string representation of the Uint8Array
 */
function bytesArrayToString(bytesArray) {
    let str = '';
    // use a for-of loop
    for (const byte of bytesArray) {
        str += String.fromCharCode(byte);
    }
    return str;
}
exports.bytesArrayToString = bytesArrayToString;
//# sourceMappingURL=bytesArrayToString.js.map