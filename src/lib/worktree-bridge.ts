import { invoke } from "@tauri-apps/api/core";

export type AgentWorktreeRequest = {
  workspacePath: string;
  branch: string;
  slug: string;
};

export function createAgentWorktree(request: AgentWorktreeRequest): Promise<string> {
  return invoke<string>("workspace_create_agent_worktree", request);
}

export function removeAgentWorktree(options: {
  workspacePath: string;
  worktreePath: string;
  branch?: string | null;
}): Promise<void> {
  return invoke("workspace_remove_agent_worktree", {
    workspacePath: options.workspacePath,
    worktreePath: options.worktreePath,
    branch: options.branch ?? null,
  });
}

export function mergeAgentWorktree(options: {
  workspacePath: string;
  worktreePath: string;
  branch: string;
}): Promise<void> {
  return invoke("workspace_merge_agent_worktree", options);
}
