import { generateEvent, createSC, fileToBase64} from '@massalabs/massa-as-sdk';

export function main(_args: string): i32 {
	const b64wasm = fileToBase64('##Wasm_file_path##');
	const contractAddr = createSC(b64wasm);
	generateEvent(`Contract deployed at address: ${contractAddr.toByteString()}`);
	return 0;
}