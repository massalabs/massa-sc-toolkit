const { exec } = require('child_process');

let cmd;

switch (process.platform) {
	case 'win32':
		cmd = 'massa-sc-tester.exe execution_config.json';
		break;
	case 'darwin':
		cmd = 'chmod +x massa-sc-tester && ./massa-sc-tester execution_config.json';
		break;
	default:
		console.error(`OS not supported`);
}

exec(cmd, (error, stdout, stderr) => {
	if (error) {
		console.log(`error: ${error.message}`);
		return;
	}
	if (stderr) {
		console.log(`stderr: ${stderr}`);
		return;
	}
	console.log(`stdout: Execution succeeds`);
});
