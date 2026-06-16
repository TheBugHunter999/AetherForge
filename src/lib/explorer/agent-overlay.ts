import { getActivitySessions } from "$lib/agent-activity/activity-store";
import type { AgentFileOverlay } from "$lib/workspace/types";
import { normalizePathKey } from "$lib/explorer/path-utils";

export function buildAgentFileOverlayMap(): Map<string, AgentFileOverlay[]> {
  const map = new Map<string, AgentFileOverlay[]>();

  for (const session of getActivitySessions()) {
    const overlay: AgentFileOverlay = {
      sessionId: session.id,
      label: session.label,
      status: session.status,
      lastTouch: session.updatedAt,
    };

    const seen = new Set<string>();
    for (const step of session.steps) {
      for (const file of step.files ?? []) {
        const key = normalizePathKey(file);
        if (seen.has(key)) continue;
        seen.add(key);
        const list = map.get(key) ?? [];
        if (!list.some((e) => e.sessionId === session.id)) {
          list.push(overlay);
          map.set(key, list);
        }
      }
    }
  }

  return map;
}

export function gitStatusForPath(
  map: ReadonlyMap<string, string>,
  path: string,
): string | null {
  return map.get(normalizePathKey(path)) ?? null;
}