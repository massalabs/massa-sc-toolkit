import { ProtoFile, getProtoFunction } from '../src/protobuf';
import { existsSync, readFileSync, writeFile, writeFileSync } from 'fs';
import { expect, test } from '@jest/globals';

function createProtoFile(name:string, args: string[], resType?: string) {
  const argMessage = `\n\nmessage ${name}Helper {\n\t${args.map((arg, idx) =>
    arg + " = "+idx.toString()+";\n\t").join('')}}`;
  const resMessage = `\n\nmessage ${name}RHelper {\n\t${(resType !== undefined) ? (resType + "= 1;") : "\n"}}`;

  writeFileSync(`./${name}.proto`, 'syntax = "proto3";'+argMessage+resMessage);
}

test("Protobuf: correct function name", async ()=> {
  createProtoFile("func", []);
  const protoData: ProtoFile = await getProtoFunction("./func.proto");

  expect(protoData.funcName).toStrictEqual("func");
});


test("Protobuf: correct return type", async ()=> {
  createProtoFile("func", [], "sint32 value");
  const protoData: ProtoFile = await getProtoFunction("./func.proto");

  expect(protoData.resType).toStrictEqual("sint32");
});

test("Protobuf: void return type", async ()=> {
  createProtoFile("func", []);
  const protoData: ProtoFile = await getProtoFunction("./func.proto");

  expect(protoData.resType).toStrictEqual("void");
});

test("Protobuf: correct argument number", async ()=> {
  createProtoFile("func", ["sint32 value", "uint64 value2"]);
  const protoData: ProtoFile = await getProtoFunction("./func.proto");

  expect(protoData.argFields.length).toStrictEqual(2);
});


test("Protobuf: correct argument name 1", async ()=> {
  createProtoFile("func", ["sint32 value", "uint64 value2"]);
  const protoData: ProtoFile = await getProtoFunction("./func.proto");

  expect(protoData.argFields[0].name).toStrictEqual("value");
});


test("Protobuf: correct argument type 1", async ()=> {
  createProtoFile("func", ["sint32 value", "uint64 value2"]);
  const protoData: ProtoFile = await getProtoFunction("./func.proto");

  expect(protoData.argFields[0].type).toStrictEqual("sint32");
});


test("Protobuf: correct argument name 2", async ()=> {
  createProtoFile("func", ["sint32 value", "uint64 value2"]);
  const protoData: ProtoFile = await getProtoFunction("./func.proto");

  expect(protoData.argFields[1].name).toStrictEqual("value2");
});


test("Protobuf: correct argument type 2", async ()=> {
  createProtoFile("func", ["sint32 value", "uint64 value2"]);
  const protoData: ProtoFile = await getProtoFunction("./func.proto");

  expect(protoData.argFields[1].type).toStrictEqual("uint64");
});