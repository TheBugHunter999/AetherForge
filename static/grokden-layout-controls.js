(() => {
  const ROOT_CLASS = "grokden-layout-controls";
  const BUTTON_CLASS = "grokden-layout-btn";
  const isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.platform || "");
  const modLabel = isMac ? "Cmd" : "Ctrl";

  function normalize(value) {
    return (value || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function markNoDrag(element) {
    element.style.webkitAppRegion = "no-drag";
    element.style.appRegion = "no-drag";
  }

  function dispatchShortcut(key, options = {}) {
    const event = new KeyboardEvent("keydown", {
      key,
      bubbles: true,
      cancelable: true,
      ctrlKey: options.ctrlKey ?? !isMac,
      metaKey: options.metaKey ?? isMac,
      shiftKey: options.shiftKey ?? false,
      altKey: options.altKey ?? false,
    });
    (document.body || document.documentElement).dispatchEvent(event);
  }

  function clickButtonByText(text) {
    const wanted = normalize(text);
    const buttons = Array.from(document.querySelectorAll("button"));
    const found = buttons.find((button) => normalize(button.textContent).includes(wanted));
    found?.click();
    return Boolean(found);
  }

  function clickSelector(selector) {
    const button = document.querySelector(selector);
    if (button instanceof HTMLButtonElement) {
      button.click();
      return true;
    }
    return false;
  }

  function icon(type) {
    if (type === "sidebar") {
      return '<svg viewBox="0 0 18 18" aria-hidden="true"><rect x="2.5" y="3" width="13" height="12" rx="2"/><path d="M7 3v12"/></svg>';
    }
    if (type === "panel") {
      return '<svg viewBox="0 0 18 18" aria-hidden="true"><rect x="2.5" y="3" width="13" height="12" rx="2"/><path d="M2.5 10.5h13"/></svg>';
    }
    if (type === "secondary") {
      return '<svg viewBox="0 0 18 18" aria-hidden="true"><rect x="2.5" y="3" width="13" height="12" rx="2"/><path d="M11 3v12"/></svg>';
    }
    if (type === "quick") {
      return '<svg viewBox="0 0 18 18" aria-hidden="true"><circle cx="8" cy="8" r="4.5"/><path d="M11.5 11.5 15 15"/></svg>';
    }
    if (type === "settings") {
      return '<svg viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="2.4"/><path d="M9 2.5v2M9 13.5v2M2.5 9h2M13.5 9h2M4.4 4.4l1.4 1.4M12.2 12.2l1.4 1.4M4.4 13.6l1.4-1.4M12.2 5.8l1.4-1.4"/></svg>';
    }
    return "";
  }

  function makeButton({ type, label, shortcut, onClick }) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `${BUTTON_CLASS} ${BUTTON_CLASS}-${type}`;
    button.setAttribute("aria-label", label);
    button.title = shortcut ? `${label} (${shortcut})` : label;
    button.innerHTML = icon(type);
    markNoDrag(button);
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      onClick();
      queueMicrotask(updateState);
      setTimeout(updateState, 80);
    });
    return button;
  }

  function createControls() {
    const controls = document.createElement("div");
    controls.className = ROOT_CLASS;
    controls.setAttribute("role", "toolbar");
    controls.setAttribute("aria-label", "Layout controls");
    markNoDrag(controls);

    controls.append(
      makeButton({
        type: "sidebar",
        label: "Toggle Primary Side Bar",
        shortcut: `${modLabel}+B`,
        onClick: () => dispatchShortcut("b"),
      }),
      makeButton({
        type: "panel",
        label: "Toggle Panel",
        shortcut: `${modLabel}+J`,
        onClick: () => dispatchShortcut("j"),
      }),
      makeButton({
        type: "secondary",
        label: "Toggle Secondary Side Bar",
        shortcut: "Agent Activity",
        onClick: () => clickButtonByText("Agent Activity"),
      }),
      makeButton({
        type: "quick",
        label: "Quick Open",
        shortcut: `${modLabel}+P`,
        onClick: () => dispatchShortcut("p"),
      }),
      makeButton({
        type: "settings",
        label: "Settings",
        shortcut: "Settings",
        onClick: () => clickSelector("button.settings-item") || clickButtonByText("Settings"),
      }),
    );

    return controls;
  }

  function isTerminalVisible() {
    const terminal = document.querySelector(".terminal");
    if (!(terminal instanceof HTMLElement)) return false;
    if (terminal.classList.contains("panel-hidden")) return false;
    if (document.querySelector(".ide.liquid-terminal-force-closed")) return false;
    const style = getComputedStyle(terminal);
    return style.display !== "none" && style.visibility !== "hidden" && terminal.offsetParent !== null;
  }

  function isSidebarVisible() {
    const sidebar = document.querySelector(".sidebar");
    if (!(sidebar instanceof HTMLElement)) return false;
    if (document.querySelector(".ide.liquid-sidebar-force-closed")) return false;
    const style = getComputedStyle(sidebar);
    return style.display !== "none" && style.visibility !== "hidden" && sidebar.offsetParent !== null;
  }

  function updateState() {
    const controls = document.querySelector(`.${ROOT_CLASS}`);
    if (!controls) return;
    controls.querySelector(`.${BUTTON_CLASS}-sidebar`)?.classList.toggle("active", isSidebarVisible());
    controls.querySelector(`.${BUTTON_CLASS}-panel`)?.classList.toggle("active", isTerminalVisible());
    controls.querySelector(`.${BUTTON_CLASS}-secondary`)?.classList.toggle("active", Boolean(document.querySelector(".secondary-sidebar")));
    controls.querySelector(`.${BUTTON_CLASS}-settings`)?.classList.toggle("active", Boolean(document.querySelector(".tab .settings-badge, .settings-view")));
    controls.querySelector(`.${BUTTON_CLASS}-quick`)?.classList.toggle("active", Boolean(document.querySelector(".quick-open, [role='dialog'] .quick-open")));
  }

  function mount() {
    const chrome = document.querySelector(".ide .window-chrome");
    if (!chrome || chrome.querySelector(`.${ROOT_CLASS}`)) {
      updateState();
      return;
    }

    const controls = createControls();
    const chromeControls = chrome.querySelector(".chrome-controls");
    chrome.insertBefore(controls, chromeControls || null);
    updateState();
  }

  const observer = new MutationObserver(() => {
    mount();
    updateState();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class", "style", "aria-selected"],
  });

  window.addEventListener("resize", updateState);
  window.addEventListener("focus", updateState);
  document.addEventListener("click", () => setTimeout(updateState, 60), true);

  mount();
})();
