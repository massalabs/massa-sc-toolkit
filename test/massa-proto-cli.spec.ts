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
    //  'test.proto' content:
    const protoContent = `syntax = "proto3";

message eventHelper {
    uint64 num = 1;
    string horse = 2;
    fixed32 blue = 3;
}
    
message eventRHelper {
    uint64 value = 1;
}`;
    
    const protoPath = './proto_build/test.proto';

    getProtoFunction(protoPath).then((protoFile: ProtoFile) => {
        expect(protoFile.argFields).toEqual([
            { name: 'num', type: 'uint64' }, 
            { name: 'horse', type: 'string' }, 
            { name: 'blue', type: 'fixed32' }
        ]);
        expect(protoFile.funcName).toEqual('test');
        expect(protoFile.resType).toEqual('uint64');
        expect(protoFile.protoData).toEqual(protoContent);
        expect(protoFile.protoPath).toEqual(protoPath);
    });
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
  