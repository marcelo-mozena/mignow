import { BusMessage, MessageBus, ElectronBus } from './ElectronBus';

export type Command = BusMessage;
export type CommandBus = MessageBus;

export class ElectronCommandBus extends ElectronBus {
  constructor() {
    super('command', /Command$/);
  }
}
