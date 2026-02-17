import { BusMessage, MessageBus, ElectronBus } from './ElectronBus';

export type Query = BusMessage;
export type QueryBus = MessageBus;

export class ElectronQueryBus extends ElectronBus {
  constructor() {
    super('query', /Query$/);
  }
}
