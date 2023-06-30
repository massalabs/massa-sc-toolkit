import { compileProtoToTSHelper } from '../packages/massa-proto-cli/src/ts-gen';
import { existsSync } from 'fs';

test('test commands', () => {
  // TODO: test commands
  expect(true).toBe(true);
});

/** 
 * extract all the necessary information from a proto file
 * (uses getProtoFunction from packages/massa-proto-cli/src/protobuf.ts)
 */
test('test protobuf.ts: getProtoFunction', () => {
  // TODO: test commands
  expect(true).toBe(true);
});


/**
 * from a proto file, generate the ts helper file
 */
test('test ts-gen: compileProtoToTSHelper', () => {
  const protoFilePath = 'test/proto_build/test.proto';
  
  // generate the ts helper file
  compileProtoToTSHelper(protoFilePath);

  // check if the ts helper file exists
  expect(existsSync('proto_build/testHelper.ts')).toBe(true);
  
  // check if the ts helper file contains the expected functions
  const num: bigint = 118712n;
  const horse: string = 'horse';
  const blue: number = 123;

  const { testHelper } = require('../proto_build/testHelper.ts');
  const serializedArgs = testHelper.toBinary({ num: num, horse: horse, blue: blue });
  
  expect(serializedArgs).toEqual(new Uint8Array([]));
});

/**
 * from a proto file, generate the ts helper and caller files
 */
test('test ts-gen: generateTSCaller', () => {
  // TODO: test generateTSCaller
  expect(true).toBe(true);
});
  