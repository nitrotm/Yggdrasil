import { describe, it, expect } from 'vitest';
import { parse as parseYaml } from 'yaml';
import { DEFAULT_CONFIG } from '../../../src/templates/default-config.js';

describe('default-config', () => {
  it('DEFAULT_CONFIG is valid YAML', () => {
    const parsed = parseYaml(DEFAULT_CONFIG);
    expect(parsed).toBeDefined();
    expect(typeof parsed).toBe('object');
  });

  it('DEFAULT_CONFIG contains required keys', () => {
    const parsed = parseYaml(DEFAULT_CONFIG) as Record<string, unknown>;
    expect(parsed.name).toBeDefined();
    expect(parsed.node_types).toBeDefined();
    expect(parsed.artifacts).toBeDefined();
    expect(parsed.quality).toBeDefined();
  });

  it('DEFAULT_CONFIG node_types includes module, service, library', () => {
    const parsed = parseYaml(DEFAULT_CONFIG) as {
      node_types: Array<{ name: string } | string>;
    };
    const names = parsed.node_types.map((t) => (typeof t === 'string' ? t : t.name));
    expect(names).toContain('module');
    expect(names).toContain('service');
    expect(names).toContain('library');
  });

  it('DEFAULT_CONFIG responsibility and interface have structural_context, internals does not', () => {
    const parsed = parseYaml(DEFAULT_CONFIG) as {
      artifacts: Record<string, { structural_context?: boolean }>;
    };
    expect(parsed.artifacts['responsibility.md'].structural_context).toBe(true);
    expect(parsed.artifacts['interface.md'].structural_context).toBe(true);
    expect(parsed.artifacts['internals.md'].structural_context).toBeUndefined();
  });

  it('DEFAULT_CONFIG node_types includes infrastructure', () => {
    const parsed = parseYaml(DEFAULT_CONFIG) as {
      node_types: Array<{ name: string } | string>;
    };
    const names = parsed.node_types.map((t) => (typeof t === 'string' ? t : t.name));
    expect(names).toContain('infrastructure');
  });

  it('DEFAULT_CONFIG quality.context_budget has warning and error', () => {
    const parsed = parseYaml(DEFAULT_CONFIG) as {
      quality: { context_budget: { warning: number; error: number } };
    };
    expect(parsed.quality.context_budget.warning).toBe(10000);
    expect(parsed.quality.context_budget.error).toBe(20000);
  });
});
