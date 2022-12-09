import { Address, Args, call } from '@massalabs/massa-as-sdk';

export function main(_: StaticArray<u8>): StaticArray<u8> {
  const address = new Address(
    'A12VkQFUXZ9HSNnGV9jWFHibFJNPMm5yYjFTjiLeQPiqM5vNEwgM',
  );
  call(address, 'event', new Args(), 0);
  return [];
}
