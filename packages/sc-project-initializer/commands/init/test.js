/* eslint-disable no-console */
import loader from "@assemblyscript/loader";
import { readFileSync } from "fs";

let moduleExports;

/**
 *
 * @param arr
 */
function byteArrToString(arr) {
  return new TextDecoder('utf-16').decode(arr);
}

/**
 *
 * @param ptr
 */
function ptrToString(ptr) {
  return byteArrToString(moduleExports.__getArrayBuffer(ptr));
}

const customImports = {
  massa: {
    assembly_script_generate_event(msgPtr) {
      console.log('event: ', ptrToString(msgPtr));
    },
  }
};

////////////////////////////////////////////////
// Copied from Generated code of as-test build
////////////////////////////////////////////////

/**
 *
 * @param pointer
 */
function __liftString(pointer) {
  if (!pointer) return null;
  const
    end = pointer + new Uint32Array(moduleExports.memory.buffer)[pointer - 4 >>> 2] >>> 1;
  const memoryU16 = new Uint16Array(moduleExports.memory.buffer);
  let
    start = pointer >>> 1;
  let string = "";
  while (end - start > 1024) string += String.fromCharCode(...memoryU16.subarray(start, start += 1024));
  return string + String.fromCharCode(...memoryU16.subarray(start, end));
}

const __module0 = customImports.massa;
const adaptedImports = {
  env: Object.assign(Object.create(globalThis), {}, {
    abort(message, fileName, lineNumber, columnNumber) {
      // ~lib/builtins/abort(~lib/string/String | null?, ~lib/string/String | null?, u32?, u32?) => void
      message = __liftString(message >>> 0);
      fileName = __liftString(fileName >>> 0);
      lineNumber = lineNumber >>> 0;
      columnNumber = columnNumber >>> 0;
      (() => {
        // @external.js
        throw Error(`${message} in ${fileName}:${lineNumber}:${columnNumber}`);
      })();
    },
    "console.log"(text) {
      // ~lib/bindings/dom/console.log(~lib/string/String) => void
      text = __liftString(text >>> 0);
      console.log(text);
    },
    "performance.now"() {
      // ~lib/bindings/dom/performance.now() => f64
      return performance.now();
    },
    "process.exit"(code) {
      // ~lib/bindings/node/process.exit(i32) => void
      process.exit(code);
    },
  }),
  massa: Object.assign(Object.create(__module0), {
    assembly_script_generate_event(event) {
      // ~lib/@massalabs/massa-as-sdk/assembly/env/env/env.generateEvent(~lib/string/String) => void
      event = __liftString(event >>> 0);
      __module0.assembly_script_generate_event(event);
    },
  }),
};

loader.instantiate(
  // Binary to instantiate
  readFileSync("./build/massa-example.spec.wasm"),
  // Additional imports
  adaptedImports
).then(({ exports }) => {
  moduleExports = exports;
  exports._start();
});





