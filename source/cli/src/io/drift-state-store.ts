import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { stringify, parse } from 'yaml';
import type { DriftState, DriftNodeState } from '../model/types.js';

const DRIFT_STATE_FILE = '.drift-state';

export async function readDriftState(yggRoot: string): Promise<DriftState> {
  try {
    const content = await readFile(path.join(yggRoot, DRIFT_STATE_FILE), 'utf-8');
    const raw = parse(content);
    if (!raw || typeof raw !== 'object') return {};

    const state: DriftState = {};
    for (const [key, value] of Object.entries(raw)) {
      if (typeof value === 'object' && value !== null && 'hash' in value) {
        state[key] = value as DriftNodeState;
      }
      // Skip legacy string entries silently
    }
    return state;
  } catch {
    return {};
  }
}

export async function writeDriftState(yggRoot: string, state: DriftState): Promise<void> {
  const content = stringify(state, { lineWidth: 0 });
  await writeFile(path.join(yggRoot, DRIFT_STATE_FILE), content, 'utf-8');
}
