import EventEmitter from 'events';
import util from 'util';

export default function EmitAppEvents() {
  EventEmitter.call(this);
}

util.inherits(EmitAppEvents, EventEmitter);

export const appEvents = new EmitAppEvents();
