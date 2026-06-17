(() => {
  const MENU_OPEN_CLASS = "grokden-menu-open";
  const TERMINAL_HIDE_CLASSES = [
    "grokden-terminal-final-hidden",
    "grokden-panel-safe-hidden",
    "grokden-terminal-hidden",
    "liquid-terminal-force-closed",
  ];

  const getIde = () => document.querySelector(".ide");
  const getOpenMenus = () => Array.from(document.querySelectorAll(`.${MENU_OPEN_CLASS}`));

  function closeMenus() {
    for (const node of getOpenMenus()) node.classList.remove(MENU_OPEN_CLASS);
  }

  function openOnly(menu) {
    closeMenus();
    menu.classList.add(MENU_OPEN_CLASS);
  }

  function anyMenuOpen() {
    return getOpenMenus().length > 0;
  }

  let closeTimer = 0;
  function scheduleMenuClose(delay = 110) {
    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(closeMenus, delay);
  }

  function cancelMenuClose() {
    window.clearTimeout(closeTimer);
  }

  function syncTerminalClasses() {
    const ide = getIde();
    if (!ide) return;

    const bridge = window.__grokdenLayout;
    let open = false;
    try {
      open = Boolean(bridge?.isTerminalOpen?.());
    } catch {
      open = false;
    }

    if (open) {
      for (const className of TERMINAL_HIDE_CLASSES) ide.classList.remove(className);
    }
  }

  document.addEventListener(
    "pointerover",
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const menu = target.closest(".grokden-menu");
      if (!menu) return;
      cancelMenuClose();

      const trigger = target.closest(".grokden-menu-trigger");
      if (trigger && anyMenuOpen()) openOnly(menu);
    },
    true,
  );

  document.addEventListener(
    "pointerout",
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const menu = target.closest(".grokden-menu");
      if (!menu || !menu.classList.contains(MENU_OPEN_CLASS)) return;
      const next = event.relatedTarget;
      if (next instanceof Node && menu.contains(next)) return;
      scheduleMenuClose();
    },
    true,
  );

  document.addEventListener(
    "pointermove",
    (event) => {
      if (!anyMenuOpen()) return;
      const target = event.target;
      if (target instanceof Element && target.closest(".grokden-menu-bar")) return;
      scheduleMenuClose(60);
    },
    true,
  );

  document.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      if (target.closest(".grokden-layout-btn-panel, .terminal-close, .terminal-tab, button[aria-label='Terminal']")) {
        window.setTimeout(syncTerminalClasses, 0);
        window.setTimeout(syncTerminalClasses, 90);
        window.setTimeout(syncTerminalClasses, 260);
      }
    },
    true,
  );

  window.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "`") {
      window.setTimeout(syncTerminalClasses, 0);
      window.setTimeout(syncTerminalClasses, 120);
      window.setTimeout(syncTerminalClasses, 280);
    }
  });

  const observer = new MutationObserver(() => syncTerminalClasses());
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class"],
  });

  window.addEventListener("resize", syncTerminalClasses);
  window.addEventListener("focus", syncTerminalClasses);
  window.setTimeout(syncTerminalClasses, 250);
})();
