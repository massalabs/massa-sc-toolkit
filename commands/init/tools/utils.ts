import fs from 'fs';

const isWasmFile = (contractWasm: string) => {
	if (contractWasm.substring(contractWasm.length - 5) !== '.wasm') {
			throw new Error(`${contractWasm} is not a .wasm file`);
	}
};

const fileExists = (contractWasm: string) => {
	if (!fs.existsSync(contractWasm)) {
			throw new Error(`Wasm contract file "${contractWasm}" does not exist. Did you forget to compile ?`);
	}
};

export const checkWasmFile = (contractWasm: string) => {
	isWasmFile(contractWasm);
	fileExists(contractWasm);
};
