import { Document, type Pair, type Scalar, YAMLMap } from 'yaml';
import type { ContextMapOutput } from '../model/types.js';

/**
 * Format a ContextMapOutput as YAML (paths-only, default mode).
 */
export function formatContextYaml(data: ContextMapOutput): string {
  const output: Record<string, unknown> = {};

  output.project = data.project;
  output.glossary = data.glossary;
  output.node = data.node;
  if (data.hierarchy.length > 0) output.hierarchy = data.hierarchy;
  if (data.dependencies.length > 0) output.dependencies = data.dependencies;
  output.meta = {
    'token-count': data.meta.tokenCount,
    'budget-status': data.meta.budgetStatus,
    breakdown: data.meta.breakdown,
  };

  const doc = new Document(output, { aliasDuplicateObjects: false });

  // Add comments before sections
  const map = doc.contents as YAMLMap;
  for (const pair of map.items as Pair<Scalar>[]) {
    const key = String(pair.key);
    switch (key) {
      case 'glossary':
        pair.key.commentBefore =
          ' Glossary: definitions of all aspects and flows referenced in this context.\n Read this first — IDs below (in node, hierarchy, dependencies) refer to entries here.';
        break;
      case 'node':
        pair.key.commentBefore = ' Target node: the component you are working on.';
        break;
      case 'hierarchy':
        pair.key.commentBefore =
          ' Hierarchy: ancestor modules from root to parent. Context is inherited top-down.';
        break;
      case 'dependencies':
        pair.key.commentBefore =
          ' Dependencies: components this node directly depends on.';
        break;
    }
  }

  return doc.toString({ lineWidth: 0 });
}

/**
 * Format the --full content section: file contents in XML-style tags.
 * Appended after YAML section with --- separator.
 */
export function formatFullContent(
  files: Array<{ path: string; content: string }>,
): string {
  if (files.length === 0) return '';
  let out = '---\n\n';
  for (const file of files) {
    out += `<${file.path}>\n${file.content}\n</${file.path}>\n\n`;
  }
  return out;
}
