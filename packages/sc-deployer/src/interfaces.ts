import { Args, EventPoller, IEvent } from '@massalabs/massa-web3';

export interface ISCData {
  data: Uint8Array;
  args?: Args;
  coins: bigint;
  protoPaths: string[],
}

export interface IEventPollerResult {
  isError: boolean;
  eventPoller: EventPoller;
  events: IEvent[];
}

export interface IDeploymentInfo {
  opId: string;
  events?: IEvent[];
}
