import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { execFileSync } from 'node:child_process';
import { loadGraphFromRef } from '../../../src/core/graph-from-git.js';

vi.mock('node:child_process', () => ({
  execFileSync: vi.fn(),
}));

describe('graph-from-git', () => {
  beforeEach(() => {
    vi.mocked(execFileSync).mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns null when not a git repo', async () => {
    vi.mocked(execFileSync).mockImplementation(() => {
      throw new Error('not a git repository');
    });

    const result = await loadGraphFromRef('/tmp/empty');

    expect(result).toBeNull();
    expect(execFileSync).toHaveBeenCalledWith(
      'git',
      ['rev-parse', 'HEAD'],
      expect.objectContaining({ cwd: '/tmp/empty' }),
    );
  });

  it('returns null when ref does not exist', async () => {
    vi.mocked(execFileSync).mockImplementation(() => {
      throw new Error('bad revision');
    });

    const result = await loadGraphFromRef('/tmp/repo', 'nonexistent-ref');

    expect(result).toBeNull();
    expect(execFileSync).toHaveBeenCalledWith('git', ['rev-parse', 'nonexistent-ref'], expect.any(Object));
  });

  it('returns null when git archive fails', async () => {
    vi.mocked(execFileSync)
      .mockImplementationOnce(() => Buffer.from('abc123'))
      .mockImplementationOnce(() => {
        throw new Error('path not found in archive');
      });

    const result = await loadGraphFromRef('/tmp/repo');

    expect(result).toBeNull();
  });

  it('returns null when tar extract fails', async () => {
    vi.mocked(execFileSync)
      .mockImplementationOnce(() => Buffer.from('abc123'))
      .mockImplementationOnce(() => Buffer.from(''))
      .mockImplementationOnce(() => {
        throw new Error('tar failed');
      });

    const result = await loadGraphFromRef('/tmp/repo');

    expect(result).toBeNull();
  });

  it('returns null when loadGraph throws after extract', async () => {
    const path = await import('node:path');
    const { mkdirSync, writeFileSync } = await import('node:fs');

    vi.mocked(execFileSync)
      .mockImplementationOnce(() => Buffer.from('abc123'))
      .mockImplementationOnce(() => Buffer.from(''))
      .mockImplementationOnce((_cmd: string, args?: readonly string[]) => {
        const cFlagIndex = args?.indexOf('-C');
        const extractDir = cFlagIndex !== undefined && cFlagIndex >= 0 ? args?.[cFlagIndex + 1] : undefined;
        if (extractDir) {
          const yggRoot = path.join(extractDir, '.yggdrasil');
          mkdirSync(path.join(yggRoot, 'model'), { recursive: true });
          writeFileSync(path.join(yggRoot, 'yg-config.yaml'), 'invalid: yaml: [[[');
        }
        return Buffer.from('');
      });

    const result = await loadGraphFromRef('/tmp/repo');
    expect(result).toBeNull();
  });

  it('returns graph when git archive and extract succeed', async () => {
    const path = await import('node:path');
    const { mkdirSync, writeFileSync } = await import('node:fs');

    vi.mocked(execFileSync)
      .mockImplementationOnce(() => Buffer.from('abc123'))
      .mockImplementationOnce(() => Buffer.from(''))
      .mockImplementationOnce((_cmd: string, args?: readonly string[]) => {
        const cFlagIndex = args?.indexOf('-C');
        const extractDir = cFlagIndex !== undefined && cFlagIndex >= 0 ? args?.[cFlagIndex + 1] : undefined;
        if (extractDir) {
          const yggRoot = path.join(extractDir, '.yggdrasil');
          mkdirSync(path.join(yggRoot, 'model', 'svc'), { recursive: true });
          writeFileSync(
            path.join(yggRoot, 'yg-config.yaml'),
            'name: T\nnode_types:\n  service:\n    description: x\nartifacts:\n  responsibility:\n    required: always\n    description: x\ntags: []',
          );
          writeFileSync(
            path.join(yggRoot, 'model', 'svc', 'yg-node.yaml'),
            'name: S\ntype: service\n',
          );
        }
        return Buffer.from('');
      });

    const result = await loadGraphFromRef('/tmp/repo');
    expect(result).not.toBeNull();
    expect(result?.nodes.size).toBeGreaterThan(0);
  });
});
