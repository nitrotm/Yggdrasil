import { describe, it, expect } from 'vitest';
import { formatContextYaml, formatFullContent } from '../../../src/formatters/context-text.js';
import type { ContextMapOutput } from '../../../src/model/types.js';
import { parse as yamlParse } from 'yaml';

function makeMinimalOutput(): ContextMapOutput {
  return {
    meta: { tokenCount: 100, budgetStatus: 'ok' },
    project: 'TestProject',
    node: {
      path: 'test/node',
      name: 'TestNode',
      type: 'library',
      mappings: ['src/test.ts'],
      aspects: [{ id: 'deterministic' }],
      flows: [],
    },
    hierarchy: [],
    dependencies: [],
    artifacts: {
      nodes: {
        'test/node': {
          files: ['model/test/node/responsibility.md'],
        },
      },
      aspects: {
        deterministic: {
          name: 'Determinism',
          files: [
            'aspects/deterministic/yg-aspect.yaml',
            'aspects/deterministic/content.md',
          ],
        },
      },
      flows: {},
    },
  };
}

describe('formatContextYaml', () => {
  it('produces valid YAML', () => {
    const output = formatContextYaml(makeMinimalOutput());
    const parsed = yamlParse(output);
    expect(parsed.node.path).toBe('test/node');
  });

  it('includes meta section at top', () => {
    const output = formatContextYaml(makeMinimalOutput());
    const parsed = yamlParse(output);
    expect(parsed.meta['token-count']).toBe(100);
    expect(parsed.meta['budget-status']).toBe('ok');
  });

  it('includes project name', () => {
    const output = formatContextYaml(makeMinimalOutput());
    const parsed = yamlParse(output);
    expect(parsed.project).toBe('TestProject');
  });

  it('includes node with aspects and mappings', () => {
    const output = formatContextYaml(makeMinimalOutput());
    const parsed = yamlParse(output);
    expect(parsed.node.name).toBe('TestNode');
    expect(parsed.node.type).toBe('library');
    expect(parsed.node.mappings).toEqual(['src/test.ts']);
    expect(parsed.node.aspects[0].id).toBe('deterministic');
  });

  it('includes artifacts registry with node files', () => {
    const output = formatContextYaml(makeMinimalOutput());
    const parsed = yamlParse(output);
    expect(parsed.artifacts.nodes['test/node'].files).toContain(
      'model/test/node/responsibility.md',
    );
  });

  it('includes artifacts registry with aspect files', () => {
    const output = formatContextYaml(makeMinimalOutput());
    const parsed = yamlParse(output);
    expect(parsed.artifacts.aspects.deterministic.name).toBe('Determinism');
    expect(parsed.artifacts.aspects.deterministic.files).toContain(
      'aspects/deterministic/content.md',
    );
  });

  it('omits hierarchy and dependencies when empty', () => {
    const output = formatContextYaml(makeMinimalOutput());
    const parsed = yamlParse(output);
    expect(parsed.hierarchy).toBeUndefined();
    expect(parsed.dependencies).toBeUndefined();
  });

  it('includes hierarchy when non-empty', () => {
    const data = makeMinimalOutput();
    data.hierarchy = [{ path: 'parent', name: 'Parent', type: 'module', aspects: [] }];
    const output = formatContextYaml(data);
    const parsed = yamlParse(output);
    expect(parsed.hierarchy).toHaveLength(1);
    expect(parsed.hierarchy[0].path).toBe('parent');
  });

  it('renders dependency with hierarchy and aspects', () => {
    const data = makeMinimalOutput();
    data.dependencies = [{
      path: 'dep/svc',
      name: 'DepService',
      type: 'service',
      relation: 'uses',
      consumes: ['doThing'],
      aspects: ['deterministic'],
      hierarchy: [{
        path: 'dep',
        name: 'Dep',
        type: 'module',
        aspects: ['deterministic'],
      }],
    }];
    data.artifacts.nodes['dep/svc'] = {
      files: ['model/dep/svc/responsibility.md', 'model/dep/svc/interface.md'],
    };
    data.artifacts.nodes['dep'] = {
      files: ['model/dep/responsibility.md'],
    };

    const output = formatContextYaml(data);
    const parsed = yamlParse(output);
    expect(parsed.dependencies[0].path).toBe('dep/svc');
    expect(parsed.dependencies[0].hierarchy[0].path).toBe('dep');
    expect(parsed.artifacts.nodes['dep/svc'].files).toHaveLength(2);
  });

  it('renders flow in artifacts with path as key', () => {
    const data = makeMinimalOutput();
    data.node.flows = [{
      path: 'checkout',
      name: 'Checkout Flow',
      aspects: ['deterministic'],
    }];
    data.artifacts.flows = {
      checkout: {
        name: 'Checkout Flow',
        aspects: ['deterministic'],
        files: ['flows/checkout/description.md'],
      },
    };

    const output = formatContextYaml(data);
    const parsed = yamlParse(output);
    expect(parsed.artifacts.flows.checkout.name).toBe('Checkout Flow');
  });

  it('renders aspect with implies', () => {
    const data = makeMinimalOutput();
    data.artifacts.aspects['cli-command-contract'] = {
      name: 'CLI Command Contract',
      implies: ['deterministic'],
      files: [
        'aspects/cli-command-contract/yg-aspect.yaml',
        'aspects/cli-command-contract/content.md',
      ],
    };

    const output = formatContextYaml(data);
    const parsed = yamlParse(output);
    expect(parsed.artifacts.aspects['cli-command-contract'].implies).toEqual(['deterministic']);
  });
});

describe('formatFullContent', () => {
  it('returns empty string for no files', () => {
    const output = formatFullContent([]);
    expect(output).toBe('');
  });

  it('wraps file contents in XML-style tags after --- separator', () => {
    const output = formatFullContent([
      { path: 'model/test/node/responsibility.md', content: 'Test content' },
    ]);
    expect(output).toContain('---');
    expect(output).toContain('<model/test/node/responsibility.md>');
    expect(output).toContain('Test content');
    expect(output).toContain('</model/test/node/responsibility.md>');
  });

  it('renders multiple files in order', () => {
    const output = formatFullContent([
      { path: 'model/a/responsibility.md', content: 'First' },
      { path: 'aspects/x/content.md', content: 'Second' },
    ]);
    const firstIdx = output.indexOf('<model/a/responsibility.md>');
    const secondIdx = output.indexOf('<aspects/x/content.md>');
    expect(firstIdx).toBeLessThan(secondIdx);
  });
});
