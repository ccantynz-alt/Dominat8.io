import { MachineState } from './_state';

export type MachineEventType =
  | 'heartbeat'
  | 'idle'
  | 'degraded'
  | 'recovered'
  | 'info'
  | 'warn'
  | 'error';

export type MachineEvent = {
  ts: string;
  type: MachineEventType;
  msg: string;
  state: MachineState;
};

const MAX_EVENTS = 100;

let EVENTS: MachineEvent[] = [];

export function appendEvent(e: MachineEvent) {
  EVENTS.push(e);
  if (EVENTS.length > MAX_EVENTS) {
    EVENTS = EVENTS.slice(EVENTS.length - MAX_EVENTS);
  }
}

export function getFeed(limit = 10): MachineEvent[] {
  return EVENTS.slice(-limit).reverse();
}

export function emit(type: MachineEventType, msg: string, state: MachineState) {
  appendEvent({
    ts: new Date().toISOString(),
    type,
    msg,
    state,
  });
}