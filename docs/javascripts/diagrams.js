/* Renders ```mermaid fences (div.diagram) at their natural size.
   - Wide diagrams scroll sideways instead of shrinking to the phone width.
   - Tapping a diagram opens it full screen, where it can be panned and
     pinch-zoomed. */
(function () {
  let counter = 0;

  function isDark() {
    return document.body.getAttribute('data-md-color-scheme') === 'slate';
  }

  function config() {
    const dark = isDark();
    return {
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'base',
      fontFamily: 'Manrope, system-ui, sans-serif',
      fontSize: 13,
      flowchart: { useMaxWidth: false, htmlLabels: true },
      sequence: { useMaxWidth: false },
      state: { useMaxWidth: false },
      er: { useMaxWidth: false },
      themeVariables: dark ? {
        fontSize: '13px',
        darkMode: true, background: '#1E1E24', primaryColor: '#3B2A20',
        primaryTextColor: '#F1E4D0', primaryBorderColor: '#C98A2B',
        lineColor: '#C2A98A', secondaryColor: '#24413E', tertiaryColor: '#2A2A30',
        noteBkgColor: '#3B2A20', noteTextColor: '#F1E4D0',
      } : {
        fontSize: '13px',
        background: '#FBF6EC', primaryColor: '#F1E4D0', primaryTextColor: '#3B2417',
        primaryBorderColor: '#8A6A4A', lineColor: '#3B2417', secondaryColor: '#DCEFEC',
        tertiaryColor: '#FBF6EC', noteBkgColor: '#FFF3D6', noteTextColor: '#3B2417',
        actorBkg: '#F1E4D0', actorBorder: '#3B2417',
      },
    };
  }

  // Opens fitted to the screen; "Actual size" switches to natural size for
  // panning, and pinch-zoom works in both.
  function openFullscreen(svg) {
    const overlay = document.createElement('div');
    overlay.className = 'diagram-overlay';
    overlay.innerHTML =
      '<div class="diagram-overlay__bar">' +
      '<button type="button" class="diagram-btn" data-act="size">Actual size</button>' +
      '<button type="button" class="diagram-btn" data-act="close" aria-label="Close diagram">✕ Close</button>' +
      '</div>';
    const holder = document.createElement('div');
    holder.className = 'diagram-overlay__body diagram-overlay__body--fit';
    holder.appendChild(svg.cloneNode(true));
    overlay.appendChild(holder);
    const close = () => { overlay.remove(); document.body.style.overflow = ''; };
    overlay.addEventListener('click', (e) => {
      const act = e.target.getAttribute && e.target.getAttribute('data-act');
      if (act === 'close') close();
      if (act === 'size') {
        const fit = holder.classList.toggle('diagram-overlay__body--fit');
        e.target.textContent = fit ? 'Actual size' : 'Fit to screen';
      }
    });
    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
    });
    document.body.style.overflow = 'hidden';
    document.body.appendChild(overlay);
  }

  async function renderAll() {
    if (!window.mermaid) return;
    window.mermaid.initialize(config());
    const blocks = document.querySelectorAll('div.diagram');
    for (const block of blocks) {
      if (!block.dataset.source) block.dataset.source = block.textContent;
      const id = 'diagram-' + (++counter);
      try {
        const { svg } = await window.mermaid.render(id, block.dataset.source);
        block.innerHTML = svg;
        block.classList.add('diagram--ready');
        block.setAttribute('role', 'button');
        block.setAttribute('tabindex', '0');
        block.setAttribute('aria-label', 'Diagram. Tap to view full screen.');
        const el = block.querySelector('svg');
        const open = () => openFullscreen(el);
        block.onclick = open;
        block.onkeydown = (e) => { if (e.key === 'Enter') open(); };
      } catch (err) {
        block.classList.add('diagram--error');
        block.textContent = 'Diagram failed to render: ' + (err && err.message ? err.message : err);
      }
    }
  }

  // Material's instant navigation emits document$ on every page view.
  if (window.document$) window.document$.subscribe(renderAll);
  else document.addEventListener('DOMContentLoaded', renderAll);

  // Re-render with matching colors when the light/dark toggle changes.
  new MutationObserver(() => {
    document.querySelectorAll('div.diagram').forEach((b) => b.classList.remove('diagram--ready'));
    renderAll();
  }).observe(document.body, { attributes: true, attributeFilter: ['data-md-color-scheme'] });
})();
