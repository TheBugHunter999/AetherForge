import type { ExplorerTreeNode, WorkspaceNode } from "$lib/workspace/types";
import type { AppSettings } from "$lib/editor-utils";
import { buildExplorerDisplayRows, type ExplorerDisplayRow } from "$lib/settings-runtime";

export function buildVisibleTreeNodes(
  root: string | null,
  childrenByParent: ReadonlyMap<string, WorkspaceNode[]>,
  expandedPaths: ReadonlySet<string>,
): ExplorerTreeNode[] {
  if (!root) return [];

  const result: ExplorerTreeNode[] = [];

  function walk(parentPath: string, depth: number) {
    const children = childrenByParent.get(parentPath) ?? [];
    for (const child of children) {
      result.push({ ...child, depth });
      if (child.isDir && expandedPaths.has(child.path)) {
        walk(child.path, depth + 1);
      }
    }
  }

  walk(root, 0);
  return result;
}

export function buildExplorerRows(
  root: string | null,
  childrenByParent: ReadonlyMap<string, WorkspaceNode[]>,
  expandedPaths: ReadonlySet<string>,
  settings: AppSettings,
  expandedNestParents: ReadonlySet<string>,
): ExplorerDisplayRow<ExplorerTreeNode>[] {
  const nodes = buildVisibleTreeNodes(root, childrenByParent, expandedPaths);
  return buildExplorerDisplayRows(nodes, settings, expandedNestParents);
}