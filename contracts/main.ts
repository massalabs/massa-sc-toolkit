import { createSC, generateEvent, fileToBase64 } from '@massalabs/massa-as-sdk';

export function main(_args: string): i32 {
	const bytes = fileToBase64('./build/index.wasm');
	const websiteDeployer = createSC(bytes);
	generateEvent(`Contract deploy at : ${websiteDeployer._value}`);
	return 0;
}
