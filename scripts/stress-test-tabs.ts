/**
 * Stress tests for editor tab state machine (mirrors +page.svelte logic).
 * Run: npx tsx scripts/stress-test-tabs.ts
 */

type EditorTab = { path: string; name: string; content: string; savedContent: string };

function normalizePathKey(path: string): string {
  return path.replace(/\\/g, "/").toLowerCase();
}

function isDirty(tab: EditorTab): boolean {
  return tab.content !== tab.savedContent;
}

/** Current closeTab from +page.svelte */
function closeTab(
  tabs: EditorTab[],
  activeTabPath: string | null,
  path: string,
  confirmClose: boolean,
  userConfirmsDiscard = true,
): { tabs: EditorTab[]; activeTabPath: string | null; closed: boolean } {
  const tab = tabs.find((t) => t.path === path);
  if (tab && isDirty(tab) && confirmClose && !userConfirmsDiscard) {
    return { tabs, activeTabPath, closed: false };
  }
  const index = tabs.findIndex((t) => t.path === path);
  if (index === -1) return { tabs, activeTabPath, closed: false };
  const remaining = tabs.filter((t) => t.path !== path);
  let nextActive = activeTabPath;
  if (activeTabPath === path) {
    nextActive = remaining.length === 0 ? null : remaining[Math.min(index, remaining.length - 1)].path;
  }
  return { tabs: remaining, activeTabPath: nextActive, closed: true };
}

/** Current openFile dedupe from +page.svelte */
function openFile(
  tabs: EditorTab[],
  activeTabPath: string | null,
  entry: { name: string; path: string; content?: string },
): { tabs: EditorTab[]; activeTabPath: string | null; opened: boolean } {
  const existing = tabs.find((tab) => tab.path === entry.path);
  if (existing) {
    return { tabs, activeTabPath: entry.path, opened: false };
  }
  const content = entry.content ?? "";
  return {
    tabs: [...tabs, { path: entry.path, name: entry.name, content, savedContent: content }],
    activeTabPath: entry.path,
    opened: true,
  };
}

/** Current restoreSession active tab assignment */
function restoreActiveTab(
  restored: EditorTab[],
  savedActive: string | null | undefined,
): string | null {
  return savedActive ?? restored[0]?.path ?? null;
}

/** Current session persistence slice */
function sessionTabs(tabs: EditorTab[]) {
  return tabs.map((t) => ({ path: t.path, name: t.name, savedContent: t.savedContent }));
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function stressCloseActiveTab(): void {
  const mk = (paths: string[]): EditorTab[] =>
    paths.map((p) => ({ path: p, name: p.split("/").pop()!, content: "x", savedContent: "x" }));

  let tabs = mk(["a", "b", "c"]);
  let active = "b";
  ({ tabs, activeTabPath: active } = closeTab(tabs, active, "b", false));
  assert(active === "c", "close middle active -> next tab");

  tabs = mk(["a", "b", "c"]);
  active = "c";
  ({ tabs, activeTabPath: active } = closeTab(tabs, active, "c", false));
  assert(active === "b", "close last active -> previous tab");

  tabs = mk(["only"]);
  active = "only";
  ({ tabs, activeTabPath: active } = closeTab(tabs, active, "only", false));
  assert(active === null && tabs.length === 0, "close sole tab -> null active");
}

function stressDuplicatePaths(): void {
  let tabs: EditorTab[] = [];
  let active: string | null = null;

  ({ tabs, activeTabPath: active } = openFile(tabs, active, {
    name: "a.ts",
    path: "C:\\proj\\a.ts",
    content: "1",
  }));
  const r = openFile(tabs, active, { name: "a.ts", path: "C:/proj/a.ts", content: "2" });
  assert(r.opened === true, "backslash vs slash should open duplicate tab (BUG)");
  assert(r.tabs.length === 2, "duplicate tabs exist");

  tabs = r.tabs;
  active = "C:/proj/a.ts";
  const closed = closeTab(tabs, active, "C:/proj/a.ts", false);
  assert(closed.tabs.length === 1, "closing slash variant leaves backslash duplicate (BUG)");

  // If two entries share the exact same path string, filter removes both at once:
  tabs = [
    { path: "dup.ts", name: "a.ts", content: "1", savedContent: "1" },
    { path: "dup.ts", name: "a.ts", content: "2", savedContent: "2" },
  ];
  const massClose = closeTab(tabs, "dup.ts", "dup.ts", false);
  assert(massClose.tabs.length === 0, "filter-by-path nukes all tabs sharing path key (BUG)");
}

function stressSessionRestoreOrder(): void {
  const saved = [
    { path: "z.ts", name: "z.ts", savedContent: "z" },
    { path: "a.ts", name: "a.ts", savedContent: "a" },
    { path: "m.ts", name: "m.ts", savedContent: "m" },
  ];
  const restored: EditorTab[] = saved.map((t) => ({
    ...t,
    content: t.savedContent,
  }));
  const order = restored.map((t) => t.name).join(",");
  assert(order === "z.ts,a.ts,m.ts", "restore preserves saved tab order");

  const staleActive = restoreActiveTab(restored, "missing.ts");
  assert(staleActive === "missing.ts", "restore keeps stale activeTabPath (BUG)");
}

function stressSaveOnClose(): void {
  const tab: EditorTab = {
    path: "a.ts",
    name: "a.ts",
    content: "dirty",
    savedContent: "clean",
  };
  const { tabs, closed } = closeTab([tab], "a.ts", "a.ts", false);
  assert(closed && tabs.length === 0, "close discards without save prompt when confirmClose off");
  assert(isDirty(tab), "dirty content never persisted on close");

  const blocked = closeTab([tab], "a.ts", "a.ts", true, false);
  assert(!blocked.closed, "confirmClose cancel keeps tab");
}

function stressSessionPersistsDiskNotBuffer(): void {
  const tabs: EditorTab[] = [
    { path: "a.ts", name: "a.ts", content: "unsaved edits", savedContent: "on disk" },
  ];
  const payload = sessionTabs(tabs);
  assert(payload[0].savedContent === "on disk", "session saves savedContent only");
  assert(payload[0].savedContent !== tabs[0].content, "unsaved buffer excluded from session");
}

function stressKeyedEachCollision(): void {
  const tabs: EditorTab[] = [
    { path: "dup.ts", name: "dup.ts", content: "a", savedContent: "a" },
    { path: "dup.ts", name: "dup.ts", content: "b", savedContent: "b" },
  ];
  const keys = new Set(tabs.map((t) => t.path));
  assert(keys.size === 1 && tabs.length === 2, "duplicate keyed-each paths in tabs array");
}

function stressCtrlWViewPriority(): void {
  // Simulates: view=settings, activeTabPath still set — current handler closes file tab.
  const view: "editor" | "settings" = "settings";
  const activeTabPath = "file.ts";
  const shouldCloseSettings = view === "settings";
  const currentClosesFile = !!activeTabPath;
  assert(shouldCloseSettings && currentClosesFile, "Ctrl+W closes file tab while Settings focused (BUG)");
}

function stressAutoSaveWrongTab(): void {
  // scheduleAutoSave saves activeTab at timeout, not the tab that was edited.
  const tabs: EditorTab[] = [
    { path: "a.ts", name: "a.ts", content: "dirty-a", savedContent: "" },
    { path: "b.ts", name: "b.ts", content: "", savedContent: "" },
  ];
  const activeTabPath = "b.ts";
  const activeTab = tabs.find((t) => t.path === activeTabPath);
  const wouldSave = activeTab && isDirty(activeTab);
  assert(!wouldSave, "autoSave timer after editing A then switching to B skips A (BUG)");
  assert(isDirty(tabs[0]), "tab A still dirty");
}

function stressNormalizedDedupe(): void {
  let tabs: EditorTab[] = [];
  const entries = [
    { name: "x.ts", path: "C:\\Proj\\X.ts" },
    { name: "x.ts", path: "c:/proj/x.ts" },
  ];
  for (const e of entries) {
    const key = normalizePathKey(e.path);
    const existing = tabs.find((t) => normalizePathKey(t.path) === key);
    if (!existing) {
      tabs = [...tabs, { path: e.path, name: e.name, content: "1", savedContent: "1" }];
    }
  }
  assert(tabs.length === 1, "normalized dedupe prevents duplicates (expected fix)");
}

const suites: Array<[string, () => void]> = [
  ["closeActiveTab", stressCloseActiveTab],
  ["duplicatePaths", stressDuplicatePaths],
  ["sessionRestoreOrder", stressSessionRestoreOrder],
  ["saveOnClose", stressSaveOnClose],
  ["sessionPersistsDiskNotBuffer", stressSessionPersistsDiskNotBuffer],
  ["keyedEachCollision", stressKeyedEachCollision],
  ["ctrlWViewPriority", stressCtrlWViewPriority],
  ["autoSaveWrongTab", stressAutoSaveWrongTab],
  ["normalizedDedupe", stressNormalizedDedupe],
];

let passed = 0;
for (const [name, fn] of suites) {
  fn();
  passed++;
  console.log(`  ok ${name}`);
}
console.log(`\n${passed}/${suites.length} tab stress suites passed (including intentional bug checks).`);