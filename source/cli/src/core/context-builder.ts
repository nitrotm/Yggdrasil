import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type {
  Graph,
  GraphNode,
  ContextPackage,
  ContextLayer,
  ContextSection,
  YggConfig,
  AspectDef,
  FlowDef,
  Relation,
} from '../model/types.js';
import { normalizeMappingPaths } from '../utils/paths.js';
import { estimateTokens } from '../utils/tokens.js';

const STRUCTURAL_RELATION_TYPES = new Set(['uses', 'calls', 'extends', 'implements']);
const EVENT_RELATION_TYPES = new Set(['emits', 'listens']);

export async function buildContext(graph: Graph, nodePath: string): Promise<ContextPackage> {
  const node = graph.nodes.get(nodePath);
  if (!node) {
    throw new Error(`Node not found: ${nodePath}`);
  }

  const nodeTags = new Set(node.meta.tags ?? []);
  const layers: ContextLayer[] = [];

  // 1. Global
  layers.push(buildGlobalLayer(graph.config));

  // 2. Hierarchy (only configured artifacts that exist in ancestor's directory)
  const ancestors = collectAncestors(node);
  for (const ancestor of ancestors) {
    layers.push(buildHierarchyLayer(ancestor, graph.config));
  }

  // 3. Own (node.yaml + configured artifacts)
  layers.push(await buildOwnLayer(node, graph.config, graph.rootPath));

  // 4. Relational (structural + event, with consumes/failure)
  for (const relation of node.meta.relations ?? []) {
    const target = graph.nodes.get(relation.target);
    if (!target) {
      throw new Error(`Broken relation: ${nodePath} -> ${relation.target} (target not found)`);
    }
    if (STRUCTURAL_RELATION_TYPES.has(relation.type)) {
      layers.push(buildStructuralRelationLayer(target, relation, graph.config));
    } else if (EVENT_RELATION_TYPES.has(relation.type)) {
      layers.push(buildEventRelationLayer(target, relation));
    }
  }

  // 5. Aspects
  for (const tag of nodeTags) {
    for (const aspect of graph.aspects) {
      if (aspect.tag === tag) {
        layers.push(buildAspectLayer(aspect));
      }
    }
  }

  // 6. Flows (node + all ancestors)
  for (const flow of collectParticipatingFlows(graph, node)) {
    layers.push(buildFlowLayer(flow));
  }

  const fullText = layers.map((l) => l.content).join('\n\n');
  const tokenCount = estimateTokens(fullText);
  const mapping = normalizeMappingPaths(node.meta.mapping);
  const sections = buildSections(layers, mapping.length > 0 ? mapping : null);

  return {
    nodePath,
    nodeName: node.meta.name,
    layers,
    sections,
    mapping: mapping.length > 0 ? mapping : null,
    tokenCount,
  };
}

function collectParticipatingFlows(graph: Graph, node: GraphNode): FlowDef[] {
  const paths = new Set<string>([node.path, ...collectAncestors(node).map((a) => a.path)]);
  return graph.flows.filter((f) => f.nodes.some((n) => paths.has(n)));
}

// --- Layer builders (exported for testing) ---

export function buildGlobalLayer(config: YggConfig): ContextLayer {
  let content = `**Project:** ${config.name}\n\n`;
  content += `**Stack:**\n`;
  for (const [key, value] of Object.entries(config.stack)) {
    content += `- ${key}: ${value}\n`;
  }
  content += `\n**Standards:**\n${config.standards || '(none)'}\n`;
  return { type: 'global', label: 'Global Context', content };
}

function filterArtifactsByConfig(
  artifacts: Array<{ filename: string; content: string }>,
  config: YggConfig,
): Array<{ filename: string; content: string }> {
  const allowed = new Set(Object.keys(config.artifacts ?? {}));
  return artifacts.filter((a) => allowed.has(a.filename));
}

export function buildHierarchyLayer(ancestor: GraphNode, config: YggConfig): ContextLayer {
  const filtered = filterArtifactsByConfig(ancestor.artifacts, config);
  const content = filtered.map((a) => `### ${a.filename}\n${a.content}`).join('\n\n');
  return {
    type: 'hierarchy',
    label: `Module Context (${ancestor.path}/)`,
    content,
  };
}

export async function buildOwnLayer(
  node: GraphNode,
  config: YggConfig,
  graphRootPath: string,
): Promise<ContextLayer> {
  const parts: string[] = [];

  const nodeYamlPath = path.join(graphRootPath, 'model', node.path, 'node.yaml');
  try {
    const nodeYamlContent = await readFile(nodeYamlPath, 'utf-8');
    parts.push(`### node.yaml\n${nodeYamlContent.trim()}`);
  } catch {
    parts.push(`### node.yaml\n(not found)`);
  }

  const filtered = filterArtifactsByConfig(node.artifacts, config);
  for (const a of filtered) {
    parts.push(`### ${a.filename}\n${a.content}`);
  }

  const content = parts.join('\n\n');
  return {
    type: 'own',
    label: `Node: ${node.meta.name}`,
    content,
  };
}

export function buildStructuralRelationLayer(
  target: GraphNode,
  relation: Relation,
  config: YggConfig,
): ContextLayer {
  let content = '';
  if (relation.consumes?.length) {
    content += `Consumes: ${relation.consumes.join(', ')}\n\n`;
  }
  if (relation.failure) {
    content += `On failure: ${relation.failure}\n\n`;
  }

  const structuralArtifactFilenames = Object.entries(config.artifacts ?? {})
    .filter(([, c]) => c.structural_context)
    .map(([filename]) => filename);

  const structuralArts = structuralArtifactFilenames
    .map((filename) => {
      const art = target.artifacts.find((a) => a.filename === filename);
      return art ? { filename: art.filename, content: art.content } : null;
    })
    .filter((a): a is { filename: string; content: string } => a !== null);

  if (structuralArts.length > 0) {
    content += structuralArts.map((a) => `### ${a.filename}\n${a.content}`).join('\n\n');
  } else {
    const filtered = filterArtifactsByConfig(target.artifacts, config);
    content += filtered.map((a) => `### ${a.filename}\n${a.content}`).join('\n\n');
  }

  return {
    type: 'relational',
    label: `Dependency: ${target.meta.name} (${relation.type}) — ${target.path}`,
    content: content.trim(),
  };
}

export function buildEventRelationLayer(target: GraphNode, relation: Relation): ContextLayer {
  const eventName = relation.event_name ?? target.meta.name;
  const isEmit = relation.type === 'emits';
  let content = isEmit
    ? `Target: ${target.path}\nYou publish ${eventName}.`
    : `Source: ${target.path}\nYou listen for ${eventName}.`;
  if (relation.consumes?.length) {
    content += `\nConsumes: ${relation.consumes.join(', ')}`;
  }
  return {
    type: 'relational',
    label: `Event: ${eventName} [${relation.type}]`,
    content,
  };
}

export function buildAspectLayer(aspect: AspectDef): ContextLayer {
  const content = aspect.artifacts.map((a) => `### ${a.filename}\n${a.content}`).join('\n\n');
  return {
    type: 'aspects',
    label: `${aspect.name} (tag: ${aspect.tag})`,
    content,
  };
}

function buildFlowLayer(flow: FlowDef): ContextLayer {
  const content = flow.artifacts.map((a) => `### ${a.filename}\n${a.content}`).join('\n\n');
  return {
    type: 'flows',
    label: `Flow: ${flow.name}`,
    content: content || '(no artifacts)',
  };
}

function buildSections(layers: ContextLayer[], mapping: string[] | null): ContextSection[] {
  const ownLayers = layers.filter((layer) => layer.type === 'own');
  if (mapping && mapping.length > 0) {
    ownLayers.push({
      type: 'own',
      label: 'Materialization Target',
      content: mapping.join(', '),
    });
  }

  return [
    { key: 'Global', layers: layers.filter((l) => l.type === 'global') },
    { key: 'Hierarchy', layers: layers.filter((l) => l.type === 'hierarchy') },
    { key: 'OwnArtifacts', layers: ownLayers },
    { key: 'Dependencies', layers: layers.filter((l) => l.type === 'relational') },
    { key: 'Aspects', layers: layers.filter((l) => l.type === 'aspects') },
    { key: 'Flows', layers: layers.filter((l) => l.type === 'flows') },
  ];
}

// --- Helpers (exported for testing) ---

export function collectAncestors(node: GraphNode): GraphNode[] {
  const ancestors: GraphNode[] = [];
  let current = node.parent;
  while (current) {
    ancestors.unshift(current);
    current = current.parent;
  }
  return ancestors;
}
