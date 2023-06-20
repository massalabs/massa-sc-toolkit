import { generateAsCallers } from './as-gen';
import { IProtoFile } from './protobuf';

function displayHelp() {
  console.log('Usage:');
  console.log('npx massa-proto-cli');
  console.log(
    '\t\t--gen sc|web3\t- the generation mode for contracts callers (sc) or web3 app (web3)',
  );
  console.log(
    '\t\t--addr contract_public_key\t- the public address of the contract to interact with',
  );
  console.log(
    '\t\t[--out output_directory]\t- optional output directory for the callers to generate (default: .)',
  );
  process.exit(1);
}

function getGenMode(args: string[]): string {
  let index = args.indexOf('--gen');
  if (index >= 0 && index + 1 < args.length) {
    return args[index + 1];
  }
  displayHelp();
  return '';
}

function getAddr(args: string[]): string {
  let index = args.indexOf('--addr');
  if (index >= 0 && index + 1 < args.length) {
    return args[index + 1];
  }
  displayHelp();
  return '';
}

function getDir(args: string[]): string {
  let index = args.indexOf('--out');
  if (index >= 0 && index + 1 < args.length) {
    return args[index + 1];
  }
  return '.';
}

function run(args: string[]) {
  let files: IProtoFile[] = [];
  let mode = getGenMode(args);
  let address = getAddr(args);
  let out = getDir(args);

  // call sc client to fetch protos

  // split and parese proto files

  // call the generator
  if (mode === 'sc') {
    generateAsCallers(files, address, out);
  }
}
é
run(process.argv);
