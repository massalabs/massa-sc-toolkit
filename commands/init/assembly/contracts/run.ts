import { Address, call, callerHasWriteAccess, generateEvent } from '@massalabs/massa-as-sdk';
import { Args, NoArg } from '@massalabs/as-types';

export function constructor(args: StaticArray<u8>): StaticArray<u8> {
  // This line is important. It ensure that this function can't be called in the future.
  // If you remove this check someone could call your constructor function and reset your SC.
  if (!callerHasWriteAccess) {
    return [];
  }
  main([]);
  return [];
}

export function main(_: StaticArray<u8>): StaticArray<u8> {
  const address = new Address(
    'A1AVtNgMMEJMBpUniiHC9vfSHjVib3PUfKn6s4ps8NyakPxwWYj',
  );
  call(address, 'event', NoArg, 0);
  return [];
}