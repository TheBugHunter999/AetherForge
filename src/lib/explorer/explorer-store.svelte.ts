import type { AppSettings } from "$lib/editor-utils";
import { buildExplorerRows } from "$lib/explorer/flat-tree";
import { folderDisplayName } from "$lib/explorer/path-utils";
import { normalizePathKey } from "$lib/explorer/path-utils";
import type { ExplorerDisplayRow } from "$lib/settings-runtime";
import type { ExplorerTreeNode, WorkspaceInfo, WorkspaceNode } from "$lib/workspace/types";
import {
  workspaceChildren,
  workspaceClose,
  workspaceGetInfo,
  workspaceGitStatus,
  workspaceOpen,
  workspaceRefresh,
} from "$lib/workspace/workspace-bridge";

let workspaceRoot = $state<string | null>(null);
let workspaceInfo = $state<WorkspaceInfo | null>(null);
let childrenByParent = $state<Map<string, WorkspaceNode[]>>(new Map());
let expandedPaths = $state<Set<string>>(new Set());
let loadingPaths = $state<Set<string>>(new Set());
let gitStatusByPath = $state<Map<string, string>>(new Map());
let selectedFolderPath = $state<string | null>(null);
let explorerError = $state<string | null>(null);
let expandedNestParents = $state<Set<string>>(new Set());
let pollTimer: ReturnType<typeof setInterval> | undefined;
let mountGeneration = 0;

export function getWorkspaceRoot() {
  return workspaceRoot;
}

export function getSelectedFolderPath() {
  return selectedFolderPath;
}

export function setSelectedFolderPath(path: string | null) {
  selectedFolderPath = path;
}

export function getWorkspaceInfo() {
  return workspaceInfo;
}

export function getExplorerError() {
  return explorerError;
}

export function getExplorerRows(settings: AppSettings): ExplorerDisplayRow<ExplorerTreeNode>[] {
  return buildExplorerRows(
    workspaceRoot,
    childrenByParent,
    expandedPaths,
    settings,
    expandedNestParents,
  );
}

export function getGitStatusMap() {
  return gitStatusByPath;
}

export function toggleNestParent(path: string) {
  const next = new Set(expandedNestParents);
  if (next.has(path)) next.delete(path);
  else next.add(path);
  expandedNestParents = next;
}

export function isNestParentExpanded(path: string) {
  return expandedNestParents.has(path);
}

export function collapseAllExplorer() {
  expandedPaths = new Set();
  expandedNestParents = new Set();
  loadingPaths = new Set();
}

function setChildren(parent: string, children: WorkspaceNode[]) {
  childrenByParent = new Map(childrenByParent).set(parent, children);
}

function applyGitMap(entries: { path: string; status: string }[]) {
  const next = new Map<string, string>();
  for (const entry of entries) {
    next.set(normalizePathKey(entry.path), entry.status);
  }
  gitStatusByPath = next;
}

async function syncGitStatus() {
  try {
    const git = await workspaceGitStatus();
    applyGitMap(git.entries);
    if (workspaceInfo && workspaceRoot) {
      workspaceInfo = {
        ...workspaceInfo,
        branch: git.branch,
        changedCount: git.changedCount,
      };
    }
  } catch (error) {
    console.error("Git status sync failed:", error);
  }
}

async function pollIndexing() {
  try {
    const info = await workspaceGetInfo();
    workspaceInfo = info;
    if (!info.indexing) {
      await syncGitStatus();
      if (workspaceRoot) {
        const children = await workspaceChildren(workspaceRoot);
        setChildren(workspaceRoot, children);
      }
      stopIndexingPoll();
    }
  } catch (error) {
    console.error("Workspace index poll failed:", error);
  }
}

function startIndexingPoll() {
  stopIndexingPoll();
  pollTimer = setInterval(() => void pollIndexing(), 600);
}

function stopIndexingPoll() {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = undefined;
}

export async function refreshGitStatus() {
  await syncGitStatus();
}

export async function invalidateChildren(parentPath: string) {
  if (!childrenByParent.has(parentPath)) return;
  const next = new Map(childrenByParent);
  next.delete(parentPath);
  childrenByParent = next;
}

export async function mountWorkspace(root: string, excludePatterns: string[] = []) {
  const gen = ++mountGeneration;
  explorerError = null;
  try {
    await workspaceClose();
    const result = await workspaceOpen(root, excludePatterns);
    if (gen !== mountGeneration) return;
    workspaceRoot = result.root;
    selectedFolderPath = result.root;
    childrenByParent = new Map([[result.root, result.children]]);
    expandedPaths = new Set();
    workspaceInfo = {
      root: result.root,
      branch: result.branch,
      changedCount: result.changedCount,
      indexing: result.indexing,
      indexedEntries: result.children.length,
      error: null,
    };
    applyGitMap([]);
    await syncGitStatus();
    if (result.indexing) startIndexingPoll();
    else stopIndexingPoll();
  } catch (error) {
    explorerError = error instanceof Error ? error.message : String(error);
    throw error;
  }
}

export async function unmountWorkspace() {
  mountGeneration++;
  stopIndexingPoll();
  try {
    await workspaceClose();
  } catch (error) {
    console.error("workspace_close failed:", error);
  }
  workspaceRoot = null;
  workspaceInfo = null;
  childrenByParent = new Map();
  expandedPaths = new Set();
  expandedNestParents = new Set();
  loadingPaths = new Set();
  gitStatusByPath = new Map();
  selectedFolderPath = null;
  explorerError = null;
}

export async function refreshExplorerIndex(_excludePatterns: string[] = []) {
  if (!workspaceRoot) return;
  explorerError = null;
  try {
    const expanded = [...expandedPaths];
    childrenByParent = new Map();
    const info = await workspaceRefresh();
    workspaceInfo = info;
    const children = await workspaceChildren(workspaceRoot);
    setChildren(workspaceRoot, children);
    for (const path of expanded) {
      if (path === workspaceRoot) continue;
      try {
        setChildren(path, await workspaceChildren(path));
      } catch {
        /* folder may have been removed */
      }
    }
    expandedPaths = new Set(expanded);
    await syncGitStatus();
    if (info.indexing) startIndexingPoll();
  } catch (error) {
    explorerError = error instanceof Error ? error.message : String(error);
    console.error("Explorer refresh failed:", error);
  }
}

export async function toggleExplorerFolder(
  path: string,
  options?: { followSymlinks?: boolean },
) {
  selectedFolderPath = path;

  if (expandedPaths.has(path)) {
    const next = new Set(expandedPaths);
    next.delete(path);
    expandedPaths = next;
    return;
  }

  if (loadingPaths.has(path)) return;

  const nextExpanded = new Set(expandedPaths);
  nextExpanded.add(path);
  expandedPaths = nextExpanded;

  if (childrenByParent.has(path)) return;

  const nextLoading = new Set(loadingPaths);
  nextLoading.add(path);
  loadingPaths = nextLoading;

  try {
    const children = await workspaceChildren(path);
    setChildren(path, children);
    explorerError = null;
  } catch (error) {
    explorerError = error instanceof Error ? error.message : String(error);
    const rolled = new Set(expandedPaths);
    rolled.delete(path);
    expandedPaths = rolled;
    console.error("Failed to load folder:", error);
  } finally {
    const done = new Set(loadingPaths);
    done.delete(path);
    loadingPaths = done;
  }

  void options;
}

export function isFolderLoading(path: string) {
  return loadingPaths.has(path);
}

export function isFolderExpanded(path: string) {
  return expandedPaths.has(path);
}

export function workspaceDisplayName() {
  return folderDisplayName(workspaceRoot);
}

export function getSearchableExplorerNodes(): WorkspaceNode[] {
  const seen = new Set<string>();
  const all: WorkspaceNode[] = [];
  for (const children of childrenByParent.values()) {
    for (const child of children) {
      if (seen.has(child.path)) continue;
      seen.add(child.path);
      all.push(child);
    }
  }
  return all;
}

export function workspaceExcludePatterns(settings: AppSettings): string[] {
  return settings.filesExcludePatterns
    .split(/[\n,;]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}