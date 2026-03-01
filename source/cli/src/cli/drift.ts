import { Command } from 'commander';
import chalk from 'chalk';
import { loadGraph } from '../core/graph-loader.js';
import { detectDrift } from '../core/drift-detector.js';

export function registerDriftCommand(program: Command): void {
  program
    .command('drift')
    .description('Detect divergence between graph and code')
    .option('--scope <scope>', 'Scope: all or node-path (default: all)', 'all')
    .action(async (options: { scope?: string }) => {
      try {
        const graph = await loadGraph(process.cwd());
        const scope = (options.scope ?? 'all').trim() || 'all';
        if (scope && scope !== 'all' && !graph.nodes.has(scope)) {
          process.stderr.write(`Error: Node not found: ${scope}\n`);
          process.exit(1);
        }
        if (scope && scope !== 'all') {
          const scopedNode = graph.nodes.get(scope)!;
          if (!scopedNode.meta.mapping) {
            process.stderr.write(
              `Error: Node has no mapping (does not participate in drift detection): ${options.scope}\n`,
            );
            process.exit(1);
          }
        }
        const scopeNode = scope === 'all' ? undefined : scope;
        const report = await detectDrift(graph, scopeNode);
        process.stdout.write('Drift:\n');
        for (const entry of report.entries) {
          switch (entry.status) {
            case 'ok':
              process.stdout.write(chalk.green(`  ok         ${entry.nodePath}\n`));
              break;
            case 'source-drift':
              process.stdout.write(chalk.red(`  src-drift  ${entry.nodePath}\n`));
              if (entry.details) process.stdout.write(`             ${entry.details}\n`);
              break;
            case 'graph-drift':
              process.stdout.write(chalk.magenta(`  gph-drift  ${entry.nodePath}\n`));
              if (entry.details) process.stdout.write(`             ${entry.details}\n`);
              break;
            case 'full-drift':
              process.stdout.write(chalk.red(`  full-drift ${entry.nodePath}\n`));
              if (entry.details) process.stdout.write(`             ${entry.details}\n`);
              break;
            case 'missing':
              process.stdout.write(chalk.yellow(`  missing    ${entry.nodePath}\n`));
              break;
            case 'unmaterialized':
              process.stdout.write(chalk.dim(`  unmat.     ${entry.nodePath}\n`));
              break;
          }
        }
        const totalDrift = report.sourceDriftCount + report.graphDriftCount + report.fullDriftCount;
        process.stdout.write(
          `\nSummary: ${totalDrift} drift (${report.sourceDriftCount} source, ${report.graphDriftCount} graph, ${report.fullDriftCount} full), ${report.missingCount} missing, ${report.unmaterializedCount} unmaterialized, ${report.okCount} ok\n`,
        );

        if (totalDrift > 0 || report.missingCount > 0 || report.unmaterializedCount > 0) {
          process.exit(1);
        }
        process.exit(0);
      } catch (error) {
        process.stderr.write(`Error: ${(error as Error).message}\n`);
        process.exit(1);
      }
    });
}
