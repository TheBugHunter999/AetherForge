import { invoke } from "@tauri-apps/api/core";
import type {
  GitStatusEntry,
  WorkspaceGitStatusMap,
  WorkspaceInfo,
  WorkspaceNode,
  WorkspaceOpenResult,
  WorkspaceSearchHit,
} from "$lib/workspace/types";

type RawWorkspaceNode = {
  name: string;
  path: string;
  parentPath: string | null;
  isDir: boolean;
  isSymlink: boolean;
};

function mapNode(raw: RawWorkspaceNode): WorkspaceNode {
  return {
    name: raw.name,
    path: raw.path,
    parentPath: raw.parentPath,
    isDir: raw.isDir,
    isSymlink: raw.isSymlink,
  };
}

export async function workspaceOpen(
  root: string,
  excludePatterns: string[] = [],
): Promise<WorkspaceOpenResult> {
  const raw = await invoke<{
    root: string;
    branch: string | null;
    changedCount: number;
    children: RawWorkspaceNode[];
    indexing: boolean;
  }>("workspace_open", { root, excludePatterns });

  return {
    root: raw.root,
    branch: raw.branch,
    changedCount: raw.changedCount,
    children: raw.children.map(mapNode),
    indexing: raw.indexing,
  };
}

export async function workspaceClose(): Promise<void> {
  await invoke("workspace_close");
}

export async function workspaceGetInfo(): Promise<WorkspaceInfo> {
  return invoke<WorkspaceInfo>("workspace_get_info");
}

export async function workspaceChildren(parentPath: string): Promise<WorkspaceNode[]> {
  const raw = await invoke<RawWorkspaceNode[]>("workspace_children", { parentPath });
  return raw.map(mapNode);
}

export async function workspaceRefresh(): Promise<WorkspaceInfo> {
  return invoke<WorkspaceInfo>("workspace_refresh");
}

export async function workspaceGitStatus(): Promise<WorkspaceGitStatusMap> {
  const raw = await invoke<{
    branch: string | null;
    changedCount: number;
    entries: GitStatusEntry[];
  }>("workspace_git_status");
  return raw;
}

export async function workspaceSearchFuzzy(
  query: string,
  limit = 50,
): Promise<WorkspaceSearchHit[]> {
  if (!query.trim()) return [];
  return invoke<WorkspaceSearchHit[]>("workspace_search_fuzzy", { query, limit });
}