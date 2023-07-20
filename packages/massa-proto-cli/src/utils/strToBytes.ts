
/**
 * Convert string to bytes
 * 
 * @param str - string to convert
 * @returns the converted string as an Uint8Array
 */
export function strToBytes(str: string): Uint8Array {
    if (!str.length) {
      return new Uint8Array(0);
    }
    return new Uint8Array(Buffer.from(str, 'utf-8'));
  }