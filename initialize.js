'use strict';

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const DEV_DEPENDENCIES = ['assemblyscript', '@massalabs/massa-as-sdk'];

export function initialize(directory) {
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
	fs.rmSync(path.join(process.cwd(), directory, 'index.html'));
	fs.rmSync(path.join(process.cwd(), directory, 'tests'), { recursive: true, force: true });

	console.log('Installation successfully completed');

	// Simulator
	fs.mkdirSync(directory + '/simulator');

	fs.writeFileSync(
		path.join(process.cwd(), directory + '/simulator', 'execution_config.json'),
		fs.readFileSync('execution_config.json')
	);

	fs.writeFileSync(
		path.join(process.cwd(), directory + '/simulator', 'massa-sc-tester'),
		fs.readFileSync('massa-sc-tester')
	);

	fs.writeFileSync(
		path.join(process.cwd(), directory + '/simulator', 'massa-sc-tester.exe'),
		fs.readFileSync('massa-sc-tester.exe')
	);

	fs.writeFileSync(
		path.join(process.cwd(), directory + '/simulator', 'simulate.js'),
		fs.readFileSync('simulate.js')
	);

	console.log('Simulator installed');
}
