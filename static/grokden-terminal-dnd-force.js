(() => {
  const OVER_CLASS = "grokden-dnd-force-over";
  const DROP_TYPES = new Set(["Files", "text/uri-list", "text/html", "text/plain"]);

  function hasPotentialDrop(event) {
    const dt = event.dataTransfer;
    if (!dt) return false;
    return Array.from(dt.types || []).some((type) => DROP_TYPES.has(type));
  }

  function terminalAtEvent(event) {
    const direct = event.target instanceof Element ? event.target.closest(".terminal-wrap") : null;
    if (direct) return direct;
    const underPointer = document.elementFromPoint(event.clientX, event.clientY);
    return underPointer?.closest?.(".terminal-wrap") ?? null;
  }

  function clearForcedOver() {
    document.querySelectorAll(`.${OVER_CLASS}`).forEach((node) => node.classList.remove(OVER_CLASS));
  }

  function setForcedOver(event) {
    const terminal = terminalAtEvent(event);
    clearForcedOver();
    if (terminal) terminal.classList.add(OVER_CLASS);
    return terminal;
  }

  for (const type of ["dragenter", "dragover"]) {
    document.addEventListener(
      type,
      (event) => {
        if (!hasPotentialDrop(event)) return;
        const terminal = setForcedOver(event);
        if (!terminal) return;
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
      },
      true,
    );
  }

  document.addEventListener(
    "drop",
    (event) => {
      if (!hasPotentialDrop(event)) return;
      const terminal = terminalAtEvent(event);
      clearForcedOver();
      if (!terminal) return;
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
    },
    true,
  );

  document.addEventListener(
    "dragleave",
    (event) => {
      if (event.relatedTarget) return;
      clearForcedOver();
    },
    true,
  );

  window.addEventListener("blur", clearForcedOver);
  window.addEventListener("mouseup", clearForcedOver);
})();
