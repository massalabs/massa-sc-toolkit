import { execSync } from 'child_process';

let cmd;

switch (process.platform) {
	case 'win32':
		cmd = 'cd simulator && massa-sc-tester.exe execution_config.json';
		break;
	case 'darwin':
		cmd = 'cd simulator && chmod +x massa-sc-tester && ./massa-sc-tester execution_config.json';
		break;
	default:
		console.error(`OS not supported`);
}
execSync(cmd);
