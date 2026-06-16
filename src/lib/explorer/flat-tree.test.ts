import { buildVisibleTreeNodes } from "$lib/explorer/flat-tree";
import type { WorkspaceNode } from "$lib/workspace/types";

function node(partial: Partial<WorkspaceNode> & Pick<WorkspaceNode, "name" | "path">): WorkspaceNode {
  return {
    parentPath: null,
    isDir: false,
    isSymlink: false,
    ...partial,
  };
}

export function runFlatTreeTests(): { name: string; ok: boolean; detail?: string }[] {
  const results: { name: string; ok: boolean; detail?: string }[] = [];
  const assert = (name: string, ok: boolean, detail?: string) => {
    results.push({ name, ok, detail: ok ? undefined : detail ?? "failed" });
  };

  const root = "C:/proj";
  const map = new Map<string, WorkspaceNode[]>([
    [root, [node({ name: "src", path: `${root}/src`, isDir: true }), node({ name: "README.md", path: `${root}/README.md` })]],
    [`${root}/src`, [node({ name: "main.ts", path: `${root}/src/main.ts` })]],
  ]);

  const collapsed = buildVisibleTreeNodes(root, map, new Set());
  assert("collapsed shows root children only", collapsed.length === 2);

  const expanded = buildVisibleTreeNodes(root, map, new Set([`${root}/src`]));
  assert("expanded includes nested file", expanded.some((n) => n.name === "main.ts"));
  assert("nested depth increments", expanded.find((n) => n.name === "main.ts")?.depth === 1);

  return results;
}