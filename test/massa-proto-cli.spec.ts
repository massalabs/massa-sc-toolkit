import { execSync } from 'child_process';
import { writeFileSync, existsSync } from 'fs';
import { getProtoFunction, ProtoFile } from '../packages/massa-proto-cli/src/protobuf';

test('test commands', () => {
    // TODO: test commands
    expect(true).toBe(true);
});

/** 
 * extract all the necessary information from a proto file
 * (uses getProtoFunction from packages\massa-proto-cli\src\protobuf.ts)
 */
test('test protobuf.ts: getProtoFunction', () => {
    // create the proto_build folder
    execSync('mkdir proto_build');

    // create a proto file 'test.proto' in './proto_build'
    const protoContent = `syntax = "proto3";

message eventHelper {
    uint64 num = 1;
    string horse = 2;
    fixed32 blue = 3;
}
    
message eventRHelper {
    uint64 value = 1;
}`;
    
    // save the proto file
    const protoPath = './proto_build/test.proto';
    writeFileSync(protoPath, protoContent);

    getProtoFunction(protoPath).then((protoFile: ProtoFile) => {
        expect(protoFile.argFields).toEqual([{ name: 'num', type: 'uint64' }, { name: 'horse', type: 'string' }, { name: 'blue', type: 'fixed32' }]);
        expect(protoFile.funcName).toEqual('event');
        expect(protoFile.resType).toEqual('uint64');
        expect(protoFile.protoData).toEqual(protoContent);
        expect(protoFile.protoPath).toEqual(protoPath);
    });

    // remove the 'proto_build' folder
    if (existsSync('proto_build') && process.platform === 'win32') {
        execSync('rmdir /s /q proto_build');
      }
      else if (existsSync('proto_build')) { 
        execSync('rm -r proto_build');
      }
});

/**
 * from a proto file, generate the ts helper file
 */
test('test ts-gen: compileProtoToTSHelper', () => {
    //TODO: test compileProtoToTSHelper
});

/**
 * from a proto file, generate the ts helper and caller files
 */
test('test ts-gen: generateTSCaller', () => {
    //TODO: test generateTSCaller
});
  