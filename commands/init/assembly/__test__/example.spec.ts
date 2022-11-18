import { event, setStorage } from "../main";
import { Address, Storage } from "@massalabs/massa-as-sdk";

describe("A group of test", (): i32 => {
    test("A test throwing an error", (): i32 => {
        event();
        const got = 42;
        const want = 41;
        if (got != want) {
            error(got.toString() + ", " + want.toString() + " was expected.");
            return TestResult.Failure;
        }
        return TestResult.Success;
    });
    return TestResult.Success;
});

describe("An other group of test", (): i32 => {
    test("Testing the Storage", (): i32 => {
        setStorage();
        assert(
            Storage.getOf(new Address("A12E6N5BFAdC2wyiBV6VJjqkWhpz1kLVp2XpbRdSnL1mKjCWT6oR"), "test") == "value",
            "Test failed",
        );
        return TestResult.Success;
    });

    return TestResult.Success;
});
