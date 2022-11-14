import { generateEvent, createSC} from '@massalabs/massa-as-sdk';

export function main(_args: string): i32 {
	const b64wasm = "##My_contract##";
	const contractAddr = createSC(b64wasm);
	generateEvent(`Contract deployed at address: ${contractAddr.toByteString()}`);
	return 0;
}