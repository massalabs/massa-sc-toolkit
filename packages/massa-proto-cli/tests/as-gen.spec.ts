import * as as from '../src/as-gen';
import { ProtoFile } from '../src/protobuf';
import { existsSync, readFileSync } from 'fs';
import { expect, test } from '@jest/globals';

test("As Caller: file exist", ()=> {
    const protoData: ProtoFile = {
        funcName: "func",
        resType: "uint32",
        protoData: "",
        protoPath: "",
        argFields: [

        ]
    };

    as.generateAsCall(protoData, "ANYADDR", ".");
    expect(existsSync("./funcCaller.ts")).toBeTruthy();
})

test("As Caller: function exists", ()=> {
    const protoData: ProtoFile = {
        funcName: "func",
        resType: "sint32",
        protoData: "",
        protoPath: "",
        argFields: [

        ]
    };

    as.generateAsCall(protoData, "ANYADDR", ".");
    const file = readFileSync("./funcCaller.ts").toString();

    expect(file.includes("export function func(")).toBeTruthy();
})

test("As Caller: correct address", ()=> {
    const protoData: ProtoFile = {
        funcName: "func",
        resType: "sint32",
        protoData: "",
        protoPath: "",
        argFields: [

        ]
    };

    as.generateAsCall(protoData, "ANYADDR", ".");
    const file = readFileSync("./funcCaller.ts").toString();

    expect(file.includes("new Address(\"ANYADDR\")")).toBeTruthy();
})

test("As Caller: return type correct / no args", ()=> {
    const protoData: ProtoFile = {
        funcName: "func",
        resType: "sint32",
        protoData: "",
        protoPath: "",
        argFields: [

        ]
    };

    as.generateAsCall(protoData, "ANYADDR", ".");
    const file = readFileSync("./funcCaller.ts").toString();

    expect(file.includes("export function func( coins: u64): i32 {")).toBeTruthy();
})

test("As Caller: no return type/ no args", ()=> {
    const protoData: ProtoFile = {
        funcName: "func",
        resType: "void",
        protoData: "",
        protoPath: "",
        argFields: [

        ]
    };

    as.generateAsCall(protoData, "ANYADDR", ".");
    const file = readFileSync("./funcCaller.ts").toString();

    expect(file.includes("export function func( coins: u64): void {")).toBeTruthy();
})

test("As Caller: no return type/ with one argument", ()=> {
    const protoData: ProtoFile = {
        funcName: "func",
        resType: "void",
        protoData: "",
        protoPath: "",
        argFields: [
            {name: "arg1", type: "sint32"},
        ]
    };

    as.generateAsCall(protoData, "ANYADDR", ".");
    const file = readFileSync("./funcCaller.ts").toString();

    expect(file.includes("export function func(arg1: i32, coins: u64): void {")).toBeTruthy();
})


test("As Caller: no return type/ with several argument", ()=> {
    const protoData: ProtoFile = {
        funcName: "func",
        resType: "void",
        protoData: "",
        protoPath: "",
        argFields: [
            {name: "arg1", type: "sint32"},
            {name: "arg2", type: "uint32"},
            {name: "arg3", type: "string"},
        ]
    };

    as.generateAsCall(protoData, "ANYADDR", ".");
    const file = readFileSync("./funcCaller.ts").toString();

    expect(file.includes("export function func(arg1: i32, arg2: u32, arg3: string, coins: u64): void {")).toBeTruthy();
})


test("As Caller: no return type/ with wrong argument", ()=> {
    const protoData: ProtoFile = {
        funcName: "func",
        resType: "void",
        protoData: "",
        protoPath: "",
        argFields: [
            {name: "arg1", type: "sint32"},
            {name: "arg2", type: "uint32"},
            {name: "arg3", type: "rdmType"},
        ]
    };

    expect(() => as.generateAsCall(protoData, "ANYADDR", ".")).toThrow();
})

test("As Caller: wrong return type / no args", ()=> {
    const protoData: ProtoFile = {
        funcName: "func",
        resType: "rdmType",
        protoData: "",
        protoPath: "",
        argFields: [
        ]
    };

    expect(() => as.generateAsCall(protoData, "ANYADDR", ".")).toThrow();
})