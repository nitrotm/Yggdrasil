import { describe, it, expect } from 'vitest';
import {
  collectReverseDependents,
  buildTransitiveChains,
  collectDescendants,
} from '../../../src/cli/impact.js';
import type { Graph, GraphNode } from '../../../src/model/types.js';

function makeNode(nodePath: string, overrides: Partial<GraphNode> = {}): GraphNode {
  return {
    path: nodePath,
    meta: { name: nodePath.split('/').pop()!, type: 'service' },
    artifacts: [],
    children: [],
    parent: null,
    ...overrides,
  };
}

function makeGraph(nodes: GraphNode[]): Graph {
  return {
    config: {
      name: 'Test',
      stack: {},
      standards: '',
      node_types: [{ name: 'service' }],
      artifacts: {},
    },
    nodes: new Map(nodes.map((n) => [n.path, n])),
    aspects: [],
    flows: [],
    schemas: [],
    rootPath: '/tmp',
  };
}

describe('collectReverseDependents', () => {
  it('returns empty when no nodes depend on target', () => {
    const target = makeNode('a');
    const graph = makeGraph([target]);
    const result = collectReverseDependents(graph, 'a');
    expect(result.direct).toEqual([]);
    expect(result.allDependents).toEqual([]);
  });

  it('finds direct dependents via structural relations', () => {
    const target = makeNode('a');
    const b = makeNode('b', {
      meta: {
        name: 'b',
        type: 'service',
        relations: [{ target: 'a', type: 'uses' }],
      },
    });
    const graph = makeGraph([target, b]);
    const result = collectReverseDependents(graph, 'a');
    expect(result.direct).toEqual(['b']);
    expect(result.allDependents).toEqual(['b']);
  });

  it('finds transitive dependents', () => {
    const a = makeNode('a');
    const b = makeNode('b', {
      meta: {
        name: 'b',
        type: 'service',
        relations: [{ target: 'a', type: 'uses' }],
      },
    });
    const c = makeNode('c', {
      meta: {
        name: 'c',
        type: 'service',
        relations: [{ target: 'b', type: 'calls' }],
      },
    });
    const graph = makeGraph([a, b, c]);
    const result = collectReverseDependents(graph, 'a');
    expect(result.direct).toEqual(['b']);
    expect(result.allDependents).toContain('b');
    expect(result.allDependents).toContain('c');
  });

  it('handles diamond dependency without duplication', () => {
    const a = makeNode('a');
    const b = makeNode('b', {
      meta: {
        name: 'b',
        type: 'service',
        relations: [{ target: 'a', type: 'uses' }],
      },
    });
    const c = makeNode('c', {
      meta: {
        name: 'c',
        type: 'service',
        relations: [
          { target: 'a', type: 'uses' },
          { target: 'b', type: 'uses' },
        ],
      },
    });
    const graph = makeGraph([a, b, c]);
    const result = collectReverseDependents(graph, 'a');
    expect(result.direct).toEqual(['b', 'c']);
    expect(new Set(result.allDependents).size).toBe(result.allDependents.length);
  });

  it('ignores event relations (emits/listens)', () => {
    const a = makeNode('a');
    const b = makeNode('b', {
      meta: {
        name: 'b',
        type: 'service',
        relations: [{ target: 'a', type: 'emits' }],
      },
    });
    const graph = makeGraph([a, b]);
    const result = collectReverseDependents(graph, 'a');
    expect(result.direct).toEqual([]);
  });
});

describe('buildTransitiveChains', () => {
  it('chains do NOT include the target node', () => {
    const a = makeNode('a');
    const b = makeNode('b', {
      meta: {
        name: 'b',
        type: 'service',
        relations: [{ target: 'a', type: 'uses' }],
      },
    });
    const c = makeNode('c', {
      meta: {
        name: 'c',
        type: 'service',
        relations: [{ target: 'b', type: 'uses' }],
      },
    });
    const graph = makeGraph([a, b, c]);
    const { direct, allDependents, reverse } = collectReverseDependents(graph, 'a');
    const chains = buildTransitiveChains('a', direct, allDependents, reverse);
    expect(chains.length).toBe(1);
    expect(chains[0]).not.toContain('<- a');
    expect(chains[0]).toBe('<- b <- c');
  });

  it('returns empty when no transitive-only deps', () => {
    const a = makeNode('a');
    const b = makeNode('b', {
      meta: {
        name: 'b',
        type: 'service',
        relations: [{ target: 'a', type: 'uses' }],
      },
    });
    const graph = makeGraph([a, b]);
    const { direct, allDependents, reverse } = collectReverseDependents(graph, 'a');
    const chains = buildTransitiveChains('a', direct, allDependents, reverse);
    expect(chains).toEqual([]);
  });
});

describe('collectDescendants', () => {
  it('returns all descendants of a parent node', () => {
    const parent = makeNode('mod');
    const child1 = makeNode('mod/a', { parent });
    const child2 = makeNode('mod/b', { parent });
    const grandchild = makeNode('mod/a/x', { parent: child1 });
    parent.children = [child1, child2];
    child1.children = [grandchild];
    const graph = makeGraph([parent, child1, child2, grandchild]);
    const result = collectDescendants(graph, 'mod');
    expect(result.sort()).toEqual(['mod/a', 'mod/a/x', 'mod/b']);
  });

  it('returns empty for leaf node', () => {
    const leaf = makeNode('leaf');
    const graph = makeGraph([leaf]);
    expect(collectDescendants(graph, 'leaf')).toEqual([]);
  });
});
