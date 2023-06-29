import { getProtoFunction, ProtoFile } from '../packages/massa-proto-cli/src/protobuf';

test('test commands', () => {
  // TODO: test commands
  expect(true).toBe(true);
});

/** 
 * extract all the necessary information from a proto file
 * (uses getProtoFunction from packages/massa-proto-cli/src/protobuf.ts)
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
    expect(protoFile.argFields).toBe([
      { name: 'num', type: 'uint64' }, 
      { name: 'horse', type: 'string' }, 
      { name: 'blue', type: 'fixed32' }
    ]);
    expect(protoFile.funcName).toBe('test');
    expect(protoFile.resType).toBe('uint64');
    expect(protoFile.protoData).toBe(protoContent);
    expect(protoFile.protoPath).toBe(protoPath);
  });
});


/**
 * from a proto file, generate the ts helper file
 */
test('test ts-gen: compileProtoToTSHelper', () => {
  // TODO: test compileProtoToTSHelper
  expect(true).toBe(true);
});

/**
 * from a proto file, generate the ts helper and caller files
 */
test('test ts-gen: generateTSCaller', () => {
  // TODO: test generateTSCaller
  expect(true).toBe(true);
});
  