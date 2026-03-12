## Logic

# Build Context Command Logic

1. `loadGraph(process.cwd())`
2. Trim node path, strip leading `./` and trailing `/`
3. `collectRelevantNodePaths(graph, nodePath)` — collects the node itself, its ancestors, direct relation targets, and ancestors of relation targets
4. `validate(graph, 'all')` — check for structural errors, but only block on errors relevant to the node's context (matching relevantNodes set). Unrelated errors are reported as ignored count.
5. `buildContext(graph, nodePath)` — assemble context package
6. `toContextMapOutput(pkg, graph)` — convert to structured map output (includes meta with token count and budget status)
7. `formatContextYaml(mapOutput)` — render as YAML
8. If `--full` flag: collect all artifact file contents from mapOutput registry (nodes, aspects, flows sections), deduplicate by path, resolve content via `findFileContent`, then `formatFullContent(allFiles)` — append file contents after YAML
9. Output to stdout

## findFileContent helper

Resolves file paths relative to `.yggdrasil/` to their content. For model files, looks up node artifacts or `nodeYamlRaw`. For aspect/flow files, looks up artifact content. For YAML definition files (`yg-node.yaml`, `yg-aspect.yaml`, `yg-flow.yaml`) not available in memory, falls back to reading from disk via `readFile`.
