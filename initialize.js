'use strict';

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { indexFile } from './contracts/index.js';
import { mainFile } from './contracts/main.js';

const DEV_DEPENDENCIES = [
	'assemblyscript',
	'@massalabs/massa-as-sdk',
	'@massalabs/as',
	'https://gitpkg.now.sh/massalabs/as/transformer?main',
	'https://github.com/massalabs/massa-sc-toolkit#2-testing-smart-contract-simulator',
];

export async function initialize(directory) {
	console.log('Installation begun...');

	if (fs.existsSync(directory)) {
		console.error(
			`Project directory ${directory} already exist. Please chose another project name.`
		);
		return;
	}

	fs.mkdirSync(directory);

	const option = { cwd: path.join(process.cwd(), directory) };

	execSync('npm init -y', option);
	execSync('npm install --save-dev ' + DEV_DEPENDENCIES.join(' '), option);
	execSync('npx asinit . -y', option);

	console.log('Packages installed');

	fs.rmSync(path.join(process.cwd(), directory, 'assembly/index.ts'));
	fs.rmSync(path.join(process.cwd(), directory, 'index.html'));
	fs.rmSync(path.join(process.cwd(), directory, 'tests'), { recursive: true, force: true });

	// Copy example contract
	fs.writeFileSync(path.join(process.cwd(), directory + '/assembly', 'index.ts'), indexFile);

	fs.writeFileSync(path.join(process.cwd(), directory + '/assembly', 'main.ts'), mainFile);

	// Script creation in packge.json
	execSync(
		`cd ${directory} && npx npm-add-script -k "build" -v "asc assembly/index.ts --target release --exportRuntime -o build/index.wasm && asc --transform transformer/file2base64.js assembly/main.ts --target release --exportRuntime -o build/main.wasm" `
	);

	execSync(
		`cd ${directory} && npx npm-add-script -k "simulate" -v "node ./simulator/simulate.js" `
	);

	// Copy Simulator content from massa-sc-toolkit in node_modules
	fs.mkdirSync(directory + '/simulator');

	fs.writeFileSync(
		path.join(process.cwd(), directory + '/simulator', 'execution_config.json'),
		fs.readFileSync(
			directory + '/node_modules/massa-sc-toolkit/simulator/execution_config.json'
		)
	);

	fs.writeFileSync(
		path.join(process.cwd(), directory + '/simulator', 'massa-sc-tester'),
		fs.readFileSync(directory + '/node_modules/massa-sc-toolkit/simulator/massa-sc-tester')
	);

	fs.writeFileSync(
		path.join(process.cwd(), directory + '/simulator', 'massa-sc-tester.exe'),
		fs.readFileSync(directory + '/node_modules/massa-sc-toolkit/simulator/massa-sc-tester.exe')
	);

	fs.writeFileSync(
		path.join(process.cwd(), directory + '/simulator', 'simulate.js'),
		fs.readFileSync(directory + '/node_modules/massa-sc-toolkit/simulator/simulate.js')
	);

	console.log('Simulator installed');

	execSync(`npm uninstall massa-sc-toolkit`);

	console.log('Installation successfully completed');
}
