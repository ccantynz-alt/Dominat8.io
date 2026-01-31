import { initialSnapshot, MachineSnapshot, LMM1_STAMP } from './_state';
import { emit } from './_feed';

export const HEARTBEAT_INTERVAL_MS = 60000;
export const DEGRADED_AFTER_MS = 180000;

export function withHeartbeat(s: MachineSnapshot): MachineSnapshot {
  const now = new Date().toISOString();
  emit('heartbeat','machine heartbeat', s.state);
return {
  ...s,
  lastEventAt: now,
};
}

export function computeHealth(s: MachineSnapshot): MachineSnapshot {
  const now = Date.now();
  const last = Date.parse(s.lastEventAt || s.since);
  if (now - last > DEGRADED_AFTER_MS) {
    emit('degraded','heartbeat timeout', 'DEGRADED');
return {
  ...s,
  state: 'DEGRADED',
};
  }
  return s;
}

export function freshSnapshot(): MachineSnapshot {
  return initialSnapshot();
}