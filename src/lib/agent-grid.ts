import type { AppSettings } from "$lib/editor-utils";
import { buildGrokLaunchCommand } from "$lib/settings-runtime";

export const MAX_AGENTS = 8;

export type AgentStatus = "idle" | "launching" | "running" | "done" | "error";

export type ParallelAgent = {
  id: string;
  label: string;
  goalId: string | null;
  injectToken: number;
  status: AgentStatus;
  role?: string;
  model?: string;
  cwd?: string | null;
  prompt?: string;
  worktreeIsolation?: boolean;
  worktreePath?: string | null;
  branch?: string | null;
  upstreamRoles?: string[];
};

export type MissionGoal = {
  id: string;
  title: string;
  notes: string;
  category: string;
};

export function createAgentId(): string {
  return `agent-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createGoalId(): string {
  return `goal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createEmptyGoal(partial?: Partial<MissionGoal>): MissionGoal {
  return {
    id: createGoalId(),
    title: partial?.title?.trim() || "New goal",
    notes: partial?.notes?.trim() || "",
    category: partial?.category?.trim() || "Goals",
  };
}

export function createEmptyAgents(count: number, goals: MissionGoal[] = []): ParallelAgent[] {
  const n = clampAgentCount(count);
  return Array.from({ length: n }, (_, i) => {
    const linked = goals[i] ?? null;
    return {
      id: createAgentId(),
      label: linked?.title ?? `Agent ${i + 1}`,
      goalId: linked?.id ?? null,
      injectToken: 0,
      status: "idle" as const,
    };
  });
}

export function buildAgentGrokCommand(settings: AppSettings): string {
  return buildGrokLaunchCommand(settings);
}

export function buildAgentSpecificGrokCommand(
  settings: AppSettings,
  agent: ParallelAgent,
): string {
  if (!agent.model || agent.model === settings.grokModel) {
    return buildGrokLaunchCommand(settings);
  }
  return buildGrokLaunchCommand({ ...settings, grokModel: agent.model });
}

export function groupGoalsByCategory(goals: MissionGoal[]): Map<string, MissionGoal[]> {
  const map = new Map<string, MissionGoal[]>();
  for (const goal of goals) {
    const cat = goal.category.trim() || "Goals";
    const list = map.get(cat) ?? [];
    list.push(goal);
    map.set(cat, list);
  }
  return map;
}

export function clampAgentCount(count: number): number {
  if (!Number.isFinite(count)) return 1;
  return Math.max(1, Math.min(MAX_AGENTS, Math.round(count)));
}

/** CSS grid dimensions for 1–4 agent panes (2×1 for two agents, 2×2 for three or four). */
export function computeAgentGridLayout(count: number): { cols: number; rows: number } {
  const n = clampAgentCount(count);
  if (n <= 1) return { cols: 1, rows: 1 };
  if (n === 2) return { cols: 2, rows: 1 };
  if (n <= 6) return { cols: 3, rows: Math.ceil(n / 3) };
  return { cols: 4, rows: 2 };
}

/** Third pane spans both columns so a 3-agent swarm does not leave an empty grid cell. */
export function shouldSpanAgentCell(agentCount: number, index: number): boolean {
  return false;
}

export function getAssignedGoalIds(agents: ParallelAgent[]): Set<string> {
  const taken = new Set<string>();
  for (const agent of agents) {
    if (agent.goalId) taken.add(agent.goalId);
  }
  return taken;
}

export function getUnassignedGoals(goals: MissionGoal[], agents: ParallelAgent[]): MissionGoal[] {
  const taken = getAssignedGoalIds(agents);
  return goals.filter((g) => !taken.has(g.id));
}

/** Pick goals for newly created agent slots without duplicating assignments. */
export function pickGoalsForNewAgents(
  goals: MissionGoal[],
  agents: ParallelAgent[],
  slotCount: number,
): MissionGoal[] {
  const n = Math.max(0, Math.min(slotCount, MAX_AGENTS));
  return getUnassignedGoals(goals, agents).slice(0, n);
}

/** Prompt injected after Grok CLI starts when an agent slot is linked to a mission goal. */
export function buildAgentInjectPrompt(
  agent: ParallelAgent,
  goals: MissionGoal[],
): string | null {
  const goal = agent.goalId ? goals.find((g) => g.id === agent.goalId) : null;
  const title = goal?.title.trim() ?? "";
  const notes = goal?.notes.trim() ?? "";
  const customPrompt = agent.prompt?.trim() ?? "";
  const role = agent.role?.trim() || agent.label.trim();
  const upstream = agent.upstreamRoles?.filter(Boolean) ?? [];
  const sections = [
    role ? `ROLE\nYou are the ${role} in a connected Grokden agent workspace.` : "",
    title || notes ? `GOAL\n${[title, notes].filter(Boolean).join("\n\n")}` : "",
    customPrompt ? `STARTING CONTEXT\n${customPrompt}` : "",
    upstream.length
      ? `ORCHESTRATION\nYour upstream collaborators are: ${upstream.join(", ")}. Read their handoff notes before changing shared artifacts, and leave a concise handoff for downstream agents.`
      : "",
    agent.worktreeIsolation
      ? `ISOLATION\nYou are running in Git worktree ${agent.branch ?? "an isolated branch"}. Keep changes scoped to this role and finish with a concise diff summary.`
      : "",
  ].filter(Boolean);
  return sections.length ? sections.join("\n\n") : null;
}
