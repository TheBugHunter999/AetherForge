export type WorkspaceNode = {
  name: string;
  path: string;
  parentPath: string | null;
  isDir: boolean;
  isSymlink: boolean;
};

export type WorkspaceOpenResult = {
  root: string;
  branch: string | null;
  changedCount: number;
  children: WorkspaceNode[];
  indexing: boolean;
};

export type WorkspaceInfo = {
  root: string | null;
  branch: string | null;
  changedCount: number;
  indexing: boolean;
  indexedEntries: number;
  error: string | null;
};

export type WorkspaceSearchHit = {
  path: string;
  name: string;
  score: number;
};

export type GitStatusEntry = {
  path: string;
  status: string;
  origPath: string | null;
};

export type WorkspaceGitStatusMap = {
  branch: string | null;
  changedCount: number;
  entries: GitStatusEntry[];
};

export type ExplorerTreeNode = WorkspaceNode & {
  depth: number;
};

export type AgentFileOverlay = {
  sessionId: string;
  label: string;
  status: string;
  lastTouch: number;
};