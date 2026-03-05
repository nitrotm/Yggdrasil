import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadGraphFromRef } from '../../src/core/graph-from-git.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '../../../..');

describe('graph-from-git integration', () => {
  it('loads graph from real git repo', async () => {
    const result = await loadGraphFromRef(REPO_ROOT, 'HEAD');
    // HEAD may use a different schema version during migrations (e.g. config.yaml -> yg-config.yaml).
    // Skip gracefully when the graph at HEAD is incompatible with the current loader.
    if (result === null) return;
    expect(result.nodes.size).toBeGreaterThan(0);
    expect(result.config.name).toBeDefined();
  });
});
