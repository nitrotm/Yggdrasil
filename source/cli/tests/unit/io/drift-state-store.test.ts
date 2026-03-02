import { describe, it, expect } from 'vitest';
import { writeFile, mkdir, rm, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  readDriftState,
  writeDriftState,
} from '../../../src/io/drift-state-store.js';
import type { DriftState } from '../../../src/model/types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('drift-state-store', () => {
  it('reads existing drift state (DriftNodeState format)', async () => {
    const tmpDir = path.join(__dirname, '../../fixtures/tmp-drift-read');
    await mkdir(tmpDir, { recursive: true });
    await writeFile(
      path.join(tmpDir, '.drift-state'),
      `orders/order-service:
  hash: abc123def456
  files:
    src/orders/order.service.ts: abc123def456
auth/auth-api:
  hash: fff789
  files:
    src/auth/auth.controller.ts: fff789
`,
      'utf-8',
    );

    const state = await readDriftState(tmpDir);

    expect(state['orders/order-service']).toEqual({
      hash: 'abc123def456',
      files: { 'src/orders/order.service.ts': 'abc123def456' },
    });
    expect(state['auth/auth-api']).toEqual({
      hash: 'fff789',
      files: { 'src/auth/auth.controller.ts': 'fff789' },
    });

    await rm(tmpDir, { recursive: true, force: true });
  });

  it('returns empty when file does not exist', async () => {
    const tmpDir = path.join(__dirname, '../../fixtures/tmp-drift-none');
    await mkdir(tmpDir, { recursive: true });

    const state = await readDriftState(tmpDir);

    expect(Object.keys(state)).toHaveLength(0);

    await rm(tmpDir, { recursive: true, force: true });
  });

  it('writeDriftState creates/updates file correctly', async () => {
    const tmpDir = path.join(__dirname, '../../fixtures/tmp-drift-write');
    await mkdir(tmpDir, { recursive: true });

    const state: DriftState = {
      'test/node': { hash: 'abc123', files: { 'src/test.ts': 'abc123' } },
    };

    await writeDriftState(tmpDir, state);

    const content = await readFile(path.join(tmpDir, '.drift-state'), 'utf-8');
    expect(content).toContain('test/node');
    expect(content).toContain('abc123');

    const readBack = await readDriftState(tmpDir);
    expect(readBack['test/node']).toEqual({ hash: 'abc123', files: { 'src/test.ts': 'abc123' } });

    await rm(tmpDir, { recursive: true, force: true });
  });

  it('handles drift state with empty object', async () => {
    const tmpDir = path.join(__dirname, '../../fixtures/tmp-drift-empty');
    await mkdir(tmpDir, { recursive: true });
    await writeFile(path.join(tmpDir, '.drift-state'), '{}\n', 'utf-8');

    const state = await readDriftState(tmpDir);
    expect(Object.keys(state)).toHaveLength(0);

    await rm(tmpDir, { recursive: true, force: true });
  });

  it('handles drift-state file with no entries key', async () => {
    const tmpDir = path.join(__dirname, '../../fixtures/tmp-drift-no-entries');
    await mkdir(tmpDir, { recursive: true });
    await writeFile(path.join(tmpDir, '.drift-state'), 'some_other_field: true\n', 'utf-8');

    const state = await readDriftState(tmpDir);
    expect(Object.keys(state)).toHaveLength(0);

    await rm(tmpDir, { recursive: true, force: true });
  });

  it('handles completely empty drift-state file', async () => {
    const tmpDir = path.join(__dirname, '../../fixtures/tmp-drift-empty-file');
    await mkdir(tmpDir, { recursive: true });
    await writeFile(path.join(tmpDir, '.drift-state'), '', 'utf-8');

    const state = await readDriftState(tmpDir);
    expect(Object.keys(state)).toHaveLength(0);

    await rm(tmpDir, { recursive: true, force: true });
  });

  it('skips legacy string entries silently', async () => {
    const tmpDir = path.join(__dirname, '../../fixtures/tmp-drift-legacy-skip');
    await mkdir(tmpDir, { recursive: true });
    await writeFile(
      path.join(tmpDir, '.drift-state'),
      `orders/order-service:
  hash: 28f3c41611792a2e0cc8a4fdffc9b2294aa49d46
  files:
    src/orders/order.service.ts: 28f3c41611792a2e0cc8a4fdffc9b2294aa49d46
auth/auth-api: flat-hash-abc
`,
      'utf-8',
    );

    const state = await readDriftState(tmpDir);

    // Object entry is preserved
    expect(state['orders/order-service']).toEqual({
      hash: '28f3c41611792a2e0cc8a4fdffc9b2294aa49d46',
      files: {
        'src/orders/order.service.ts': '28f3c41611792a2e0cc8a4fdffc9b2294aa49d46',
      },
    });
    // Legacy string entry is skipped
    expect(state['auth/auth-api']).toBeUndefined();

    await rm(tmpDir, { recursive: true, force: true });
  });

  it('write and read roundtrip', async () => {
    const tmpDir = path.join(__dirname, '../../fixtures/tmp-drift-roundtrip');
    await mkdir(tmpDir, { recursive: true });

    const state: DriftState = {
      'multi/svc': { hash: 'sha256abc123', files: { 'src/multi.ts': 'sha256abc123' } },
      'other/node': { hash: 'sha256def456', files: { 'src/other.ts': 'sha256def456' } },
    };

    await writeDriftState(tmpDir, state);
    const readBack = await readDriftState(tmpDir);
    expect(readBack['multi/svc']).toEqual({
      hash: 'sha256abc123',
      files: { 'src/multi.ts': 'sha256abc123' },
    });
    expect(readBack['other/node']).toEqual({
      hash: 'sha256def456',
      files: { 'src/other.ts': 'sha256def456' },
    });

    await rm(tmpDir, { recursive: true, force: true });
  });
});
