import { ProtoFile } from './protobuf';

function sendOperation(protoFile: ProtoFile, contractAddress: string): string {
  let content = `\t// Call the Smart Contract and get an operation ID\n`;
  content += `\tconst opId = await account.callSC("`;
  content += `${contractAddress}", "${protoFile.funcName}", serializedArgs, amount: bigint);\n`;
  return content;
}
