import { stringify } from 'yaml';
import type { ContextPackage, ContextLayer, ContextMapOutput } from '../model/types.js';

function escapeAttr(val: string): string {
  return val.replace(/"/g, '&quot;');
}

function formatLayer(layer: ContextLayer): string {
  switch (layer.type) {
    case 'global':
      return `<global>\n${layer.content}\n</global>`;
    case 'hierarchy': {
      const pathMatch = layer.label.match(/\((.+)\/\)/);
      const pathAttr = pathMatch ? ` path="${escapeAttr(pathMatch[1])}"` : '';
      const aspectsAttr = layer.attrs?.aspects ? ` aspects="${escapeAttr(layer.attrs.aspects)}"` : '';
      return `<hierarchy${pathAttr}${aspectsAttr}>\n${layer.content}\n</hierarchy>`;
    }
    case 'own': {
      if (layer.label === 'Materialization Target') {
        return `<materialization-target paths="${escapeAttr(layer.content)}" />`;
      }
      const ownAspectsAttr = layer.attrs?.aspects ? ` aspects="${escapeAttr(layer.attrs.aspects)}"` : '';
      return `<own-artifacts${ownAspectsAttr}>\n${layer.content}\n</own-artifacts>`;
    }
    case 'aspects': {
      const nameMatch = layer.label.match(/^(.+?) \(aspect: (.+)\)$/);
      const name = nameMatch ? escapeAttr(nameMatch[1]) : '';
      const id = nameMatch ? escapeAttr(nameMatch[2]) : '';
      return `<aspect name="${name}" id="${id}">\n${layer.content}\n</aspect>`;
    }
    case 'relational': {
      const attrs = layer.attrs ?? {};
      const attrStr = Object.entries(attrs)
        .map(([k, v]) => ` ${k}="${escapeAttr(v)}"`)
        .join('');
      const tagName = attrs.type && ['emits', 'listens'].includes(attrs.type) ? 'event' : 'dependency';
      return `<${tagName}${attrStr}>\n${layer.content}\n</${tagName}>`;
    }
    case 'flows': {
      const flowName = layer.label.replace(/^Flow: /, '').trim();
      const flowAspectsAttr = layer.attrs?.aspects ? ` aspects="${escapeAttr(layer.attrs.aspects)}"` : '';
      return `<flow name="${escapeAttr(flowName)}"${flowAspectsAttr}>\n${layer.content}\n</flow>`;
    }
    default:
      return layer.content;
  }
}

export function formatContextText(pkg: ContextPackage): string {
  const attrs = [
    `node-path="${escapeAttr(pkg.nodePath)}"`,
    `node-name="${escapeAttr(pkg.nodeName)}"`,
    `token-count="${pkg.tokenCount}"`,
  ].join(' ');

  let out = `<context-package ${attrs}>\n\n`;

  for (const section of pkg.sections) {
    for (const layer of section.layers) {
      out += formatLayer(layer) + '\n\n';
    }
  }

  out += '</context-package>';
  return out;
}

/**
 * Format a ContextMapOutput as YAML (paths-only, default mode).
 */
export function formatContextYaml(data: ContextMapOutput): string {
  const output: Record<string, unknown> = {
    meta: {
      'token-count': data.meta.tokenCount,
      'budget-status': data.meta.budgetStatus,
    },
    project: data.project,
    node: data.node,
    hierarchy: data.hierarchy.length > 0 ? data.hierarchy : undefined,
    dependencies: data.dependencies.length > 0 ? data.dependencies : undefined,
    artifacts: data.artifacts,
  };

  // Remove undefined keys
  for (const key of Object.keys(output)) {
    if (output[key] === undefined) delete output[key];
  }

  return stringify(output, { lineWidth: 0 });
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
