import { getOf } from "@massalabs/massa-as-sdk/assembly/std/storage";
import { event, setStorage } from "../index";
import { Address } from "@massalabs/massa-as-sdk";

describe("A group of test", () => {
    test("A test throwing an error", () => {
        event();
        const got = 42;
        const want = 41;
        expect(got).toBe(want);
    });
});

describe("An other group of test", () => {
    test("Testing the Storage", () => {
        setStorage();
        expect(
            getOf(
                new Address(
                    "A12E6N5BFAdC2wyiBV6VJjqkWhpz1kLVp2XpbRdSnL1mKjCWT6oR"
                ),
                "test"
            ))
        .toBe("value");
    });
});
