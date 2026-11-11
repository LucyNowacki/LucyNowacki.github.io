/* Floating, non-modal mathematics window. No dependency on the lesson state. */
(function () {
  'use strict';

  let nextId = 0;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  window.createMathWindow = function createMathWindow(options = {}) {
    const id = `jl-window-${++nextId}`;
    const events = new AbortController();
    const on = (target, type, listener) => target.addEventListener(type, listener, { signal: events.signal });
    const element = document.createElement('section');
    element.className = 'jl-window';
    element.hidden = true;
    element.tabIndex = -1;
    element.setAttribute('role', 'dialog');
    element.setAttribute('aria-modal', 'false');
    element.setAttribute('aria-labelledby', `${id}-title`);
    element.innerHTML = `
      <header class="jl-window-header">
        <h2 class="jl-window-title" id="${id}-title"></h2>
        <div class="jl-window-actions">
          <button type="button" class="jl-window-move" title="Drag the title bar, or focus this button and use arrow keys. Shift moves farther." aria-label="Move math window with arrow keys">↔ Move</button>
          <button type="button" class="jl-window-pin" aria-pressed="false" title="Keep the window open while changing lesson controls">Pin</button>
          <button type="button" class="jl-window-expand" aria-pressed="false" aria-label="Expand math window to fit screen" title="Expand or restore; also double-click the title bar">⤢</button>
          <button type="button" class="jl-window-close" aria-label="Close math window" title="Close (Escape)">×</button>
        </div>
      </header>
      <div class="jl-window-scale-controls">
        <label for="${id}-scale">Content size</label>
        <button type="button" class="jl-window-smaller" aria-label="Make math content smaller">A−</button>
        <input id="${id}-scale" class="jl-window-scale" type="range" min="80" max="200" step="10" value="100">
        <output class="jl-window-scale-value" for="${id}-scale">100%</output>
        <button type="button" class="jl-window-larger" aria-label="Make math content larger">A+</button>
      </div>
      <p class="jl-window-status">Pin to keep this window open while using the controls.</p>
      <div class="jl-window-body"></div>
      <button type="button" class="jl-window-resize jl-window-edge-se" data-resize-edge="se" aria-label="Resize math window; drag or use arrow keys" title="Drag any edge or corner to resize. Arrow keys resize; Shift uses larger steps.">↘</button>
    `;
    const find = selector => element.querySelector(selector);
    const title = find('.jl-window-title');
    title.textContent = options.title || 'Math for this view';
    const body = find('.jl-window-body');
    const header = find('.jl-window-header');
    const pinButton = find('.jl-window-pin');
    const expandButton = find('.jl-window-expand');
    const moveButton = find('.jl-window-move');
    const resizeButton = find('.jl-window-resize');
    const scale = find('.jl-window-scale');
    const smaller = find('.jl-window-smaller');
    const larger = find('.jl-window-larger');
    const status = find('.jl-window-status');
    for (const edge of ['n', 's', 'w', 'e', 'nw', 'ne', 'sw']) {
      const handle = document.createElement('div');
      handle.className = `jl-window-edge jl-window-edge-${edge}`;
      handle.dataset.resizeEdge = edge;
      handle.setAttribute('aria-hidden', 'true');
      element.appendChild(handle);
    }
    document.body.appendChild(element);

    let pinned = false;
    let expanded = null;
    let interaction = null;
    let opener = null;
    let placed = false;
    let destroyed = false;

    function bounds() {
      const margin = Math.min(8, window.innerWidth / 4, window.innerHeight / 4);
      return {
        margin,
        width: Math.max(1, window.innerWidth - 2 * margin),
        height: Math.max(1, window.innerHeight - 2 * margin)
      };
    }

    function setRect(rect) {
      const b = bounds();
      const width = clamp(rect.width, Math.min(300, b.width), b.width);
      const height = clamp(rect.height, Math.min(200, b.height), b.height);
      const left = clamp(rect.left, b.margin, window.innerWidth - b.margin - width);
      const top = clamp(rect.top, b.margin, window.innerHeight - b.margin - height);
      Object.assign(element.style, {
        left: `${left}px`, top: `${top}px`, width: `${width}px`, height: `${height}px`
      });
      placed = true;
    }

    function currentRect() {
      const r = element.getBoundingClientRect();
      return { left: r.left, top: r.top, width: r.width, height: r.height };
    }

    function clearExpanded() {
      expanded = null;
      expandButton.setAttribute('aria-pressed', 'false');
      expandButton.setAttribute('aria-label', 'Expand math window to fit screen');
    }

    function fitScreen() {
      const b = bounds();
      setRect({ left: b.margin, top: b.margin, width: b.width, height: b.height });
    }

    function toggleExpanded() {
      if (expanded) {
        const restore = expanded;
        clearExpanded();
        setRect(restore);
      } else {
        expanded = currentRect();
        fitScreen();
        expandButton.setAttribute('aria-pressed', 'true');
        expandButton.setAttribute('aria-label', 'Restore math window size');
      }
    }

    function stopInteraction() {
      const previous = interaction;
      interaction = null;
      element.removeAttribute('data-interacting');
      if (previous && previous.handle.hasPointerCapture(previous.pointer)) {
        previous.handle.releasePointerCapture(previous.pointer);
      }
    }

    function close(restoreFocus = true) {
      if (destroyed || element.hidden) return;
      stopInteraction();
      element.hidden = true;
      if (restoreFocus && opener && opener.isConnected && typeof opener.focus === 'function') {
        opener.focus({ preventScroll: true });
      }
      element.dispatchEvent(new CustomEvent('jl-window-close'));
    }

    function open() {
      if (destroyed || !element.hidden) return;
      opener = document.activeElement;
      element.hidden = false;
      if (!placed) {
        const b = bounds();
        const width = Math.min(560, b.width);
        const height = clamp(window.innerHeight * 0.65, Math.min(200, b.height), b.height);
        setRect({ left: window.innerWidth - width - 16, top: window.innerHeight - height - 16, width, height });
      } else if (expanded) {
        fitScreen();
      } else {
        setRect(currentRect());
      }
      pinButton.focus({ preventScroll: true });
      element.dispatchEvent(new CustomEvent('jl-window-open'));
    }

    function setScale(value) {
      const percent = clamp(Math.round(value / 10) * 10, 80, 200);
      element.style.setProperty('--jl-window-scale', String(percent / 100));
      scale.value = String(percent);
      scale.setAttribute('aria-valuetext', `${percent} percent`);
      find('.jl-window-scale-value').value = `${percent}%`;
      smaller.disabled = percent === 80;
      larger.disabled = percent === 200;
    }

    function startInteraction(event, handle, edge) {
      if (event.button !== 0 || interaction) return;
      event.preventDefault();
      event.stopPropagation();
      const rect = currentRect();
      // A title-bar click must leave expand/restore state intact for dblclick.
      // Only a real drag restores an expanded window under the pointer.
      if (edge) clearExpanded();
      interaction = { handle, pointer: event.pointerId, x: event.clientX, y: event.clientY, rect, edge, dragging: Boolean(edge) };
      if (edge) element.dataset.interacting = 'resize';
      handle.setPointerCapture(event.pointerId);
    }

    function updateInteraction(event) {
      if (!interaction || interaction.pointer !== event.pointerId) return;
      const { rect, edge } = interaction;
      const dx = event.clientX - interaction.x;
      const dy = event.clientY - interaction.y;
      if (!edge) {
        if (!interaction.dragging) {
          if (Math.hypot(dx, dy) < 4) return;
          interaction.dragging = true;
          element.dataset.interacting = 'move';
          if (expanded) {
            const ratio = (interaction.x - rect.left) / rect.width;
            const restore = expanded;
            clearExpanded();
            setRect({ ...restore, left: event.clientX - restore.width * ratio, top: event.clientY - 22 });
            interaction.rect = currentRect();
            interaction.x = event.clientX;
            interaction.y = event.clientY;
            return;
          }
        }
        setRect({ ...rect, left: rect.left + dx, top: rect.top + dy });
        return;
      }
      const b = bounds();
      const minWidth = Math.min(300, b.width);
      const minHeight = Math.min(200, b.height);
      let left = rect.left;
      let top = rect.top;
      let right = rect.left + rect.width;
      let bottom = rect.top + rect.height;
      if (edge.includes('w')) left = clamp(left + dx, b.margin, right - minWidth);
      if (edge.includes('e')) right = clamp(right + dx, left + minWidth, window.innerWidth - b.margin);
      if (edge.includes('n')) top = clamp(top + dy, b.margin, bottom - minHeight);
      if (edge.includes('s')) bottom = clamp(bottom + dy, top + minHeight, window.innerHeight - b.margin);
      setRect({ left, top, width: right - left, height: bottom - top });
    }

    on(header, 'pointerdown', event => {
      const button = event.target.closest('button');
      if (button && button !== moveButton) return;
      startInteraction(event, header, '');
    });
    on(header, 'dblclick', event => {
      if (!event.target.closest('button')) toggleExpanded();
    });
    for (const handle of element.querySelectorAll('[data-resize-edge]')) {
      on(handle, 'pointerdown', event => startInteraction(event, handle, handle.dataset.resizeEdge));
    }
    for (const handle of [header, ...element.querySelectorAll('[data-resize-edge]')]) {
      on(handle, 'pointermove', updateInteraction);
      for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
        on(handle, type, event => {
          if (interaction && interaction.pointer === event.pointerId) stopInteraction();
        });
      }
    }

    function arrowDelta(event) {
      const step = event.shiftKey ? 40 : 10;
      const delta = {
        ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step]
      }[event.key];
      if (delta) event.preventDefault();
      return delta;
    }
    on(moveButton, 'keydown', event => {
      const delta = arrowDelta(event);
      if (!delta) return;
      const rect = currentRect();
      clearExpanded();
      setRect({ ...rect, left: rect.left + delta[0], top: rect.top + delta[1] });
    });
    on(resizeButton, 'keydown', event => {
      const delta = arrowDelta(event);
      if (!delta) return;
      const rect = currentRect();
      const b = bounds();
      clearExpanded();
      setRect({ ...rect,
        width: clamp(rect.width + delta[0], Math.min(300, b.width), window.innerWidth - b.margin - rect.left),
        height: clamp(rect.height + delta[1], Math.min(200, b.height), window.innerHeight - b.margin - rect.top)
      });
    });
    on(pinButton, 'click', () => {
      pinned = !pinned;
      pinButton.textContent = pinned ? 'Unpin' : 'Pin';
      pinButton.setAttribute('aria-pressed', String(pinned));
      status.textContent = pinned
        ? 'Pinned · stays open and follows the controls.'
        : 'Pin to keep this window open while using the controls.';
    });
    on(expandButton, 'click', toggleExpanded);
    on(find('.jl-window-close'), 'click', () => close());
    on(scale, 'input', () => setScale(Number(scale.value)));
    on(smaller, 'click', () => setScale(Number(scale.value) - 10));
    on(larger, 'click', () => setScale(Number(scale.value) + 10));
    on(document, 'pointerdown', event => {
      if (element.hidden || pinned || element.contains(event.target)) return;
      if (opener && opener.contains(event.target)) return;
      close(false);
    });
    on(document, 'keydown', event => {
      if (event.key === 'Escape' && !event.defaultPrevented && !element.hidden) {
        event.preventDefault();
        close();
      }
    });
    on(window, 'resize', () => {
      if (element.hidden) return;
      stopInteraction();
      if (expanded) fitScreen();
      else setRect(currentRect());
    });
    setScale(100);

    return {
      element,
      body,
      open,
      close: () => close(),
      isOpen: () => !destroyed && !element.hidden,
      // The lesson supplies trusted generated HTML and manages MathJax typesetting.
      setContent(html) { if (!destroyed) body.innerHTML = html; },
      destroy() {
        if (destroyed) return;
        close();
        events.abort();
        element.remove();
        destroyed = true;
      }
    };
  };
}());
