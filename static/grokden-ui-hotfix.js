(() => {
  const MENU_OPEN_CLASS = "grokden-menu-open";

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
})();