import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

// ==================== TYPES ====================
export interface DemoStep {
  target: string;  // CSS selector (comma-separated fallbacks)
  text: string;    // HTML content for tooltip
  pos?: 'top' | 'bottom' | 'left' | 'right';
  wait?: 'click' | 'observe' | 'validate' | string; // string = appear:<selector>
  validate?: () => boolean;
  setup?: () => void;
}

export interface DemoFeature {
  id: string;
  name: string;
  steps: DemoStep[];
}

interface DemoRunnerProps {
  feature: DemoFeature | null;
  onEnd: () => void;
}

// ==================== STYLES ====================
const STYLES = `
  .pd-hl {
    position: fixed; z-index: 9999;
    border-radius: 10px;
    box-shadow: 0 0 0 4000px rgba(0,0,0,0.45);
    pointer-events: none;
    transition: left 0.25s cubic-bezier(0.4,0,0.2,1),
                top 0.25s cubic-bezier(0.4,0,0.2,1),
                width 0.25s cubic-bezier(0.4,0,0.2,1),
                height 0.25s cubic-bezier(0.4,0,0.2,1);
    animation: pd-pulse 1.5s ease-in-out infinite;
  }
  @keyframes pd-pulse {
    0%, 100% { box-shadow: 0 0 0 4000px rgba(0,0,0,0.45), 0 0 0 0 rgba(47, 128, 237,0.4); }
    50% { box-shadow: 0 0 0 4000px rgba(0,0,0,0.45), 0 0 0 8px rgba(47, 128, 237,0.15); }
  }
  .pd-tip {
    position: fixed; z-index: 10000;
    width: 300px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08);
    padding: 16px 18px;
    font-family: var(--font-family, 'Open Sans', sans-serif);
    color: #36415D;
    pointer-events: auto;
  }
  .pd-progress {
    display: flex; gap: 4px; justify-content: center; margin-bottom: 10px;
  }
  .pd-dot {
    width: 6px; height: 6px; border-radius: 50%; background: #C2C9DB;
    transition: all 0.2s;
  }
  .pd-dot.done { background: #2F80ED; }
  .pd-dot.current { background: #2F80ED; width: 18px; border-radius: 3px; }
  .pd-step {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 11px; color: #868D9E; margin-bottom: 6px;
  }
  .pd-step-skip {
    cursor: pointer; text-decoration: underline; opacity: 0.7;
  }
  .pd-step-skip:hover { opacity: 1; }
  .pd-text {
    font-size: 13px; line-height: 1.5; margin-bottom: 12px;
  }
  .pd-text b { font-weight: 600; color: #2F80ED; }
  .pd-wait {
    font-size: 11px; color: #868D9E; text-align: center;
    padding: 6px 0; border-top: 1px solid #E9E9E9;
    animation: pd-blink 1.5s ease-in-out infinite;
  }
  @keyframes pd-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  .pd-btns {
    display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px;
  }
  .pd-b {
    padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 600;
    cursor: pointer; border: none; transition: all 0.15s;
    font-family: var(--font-family, 'Open Sans', sans-serif);
  }
  .pd-b-pri { background: #2F80ED; color: white; }
  .pd-b-pri:hover { background: #6d03a0; }
  .pd-b-sec { background: #E9E9E9; color: #36415D; }
  .pd-b-sec:hover { background: #D9E0F0; }
  .pd-b-done { background: #2F80ED; color: white; }
  .pd-b-done:hover { background: #2571d1; }
  .pd-arrow {
    position: absolute; width: 12px; height: 12px;
    background: #fff; transform: rotate(45deg);
    box-shadow: 2px 2px 4px rgba(0,0,0,0.06);
  }
  .pd-complete-icon {
    text-align: center; font-size: 36px; color: #11E874;
    margin-bottom: 8px;
  }
  .pd-complete-title {
    text-align: center; font-size: 16px; font-weight: 700;
    margin-bottom: 4px; color: #36415D;
  }
  .pd-complete-desc {
    text-align: center; font-size: 13px; color: #868D9E;
    margin-bottom: 12px; line-height: 1.4;
  }
  .pd-complete-desc b { font-weight: 600; color: #2F80ED; }
`;

// ==================== COMPONENT ====================
export function DemoRunner({ feature, onEnd }: DemoRunnerProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [completed, setCompleted] = useState(false);
  const hlRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void)[]>([]);
  const trackRafRef = useRef<number>(0); // dedicated rAF for position tracking
  const featureRef = useRef(feature);
  featureRef.current = feature;

  // Inject styles once
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = STYLES;
    document.head.appendChild(style);
    return () => { style.remove(); };
  }, []);

  // Block mousedown propagation from tooltip to prevent useClickOutside from firing
  useEffect(() => {
    const tip = tipRef.current;
    if (!tip || !feature) return;
    const stop = (e: MouseEvent) => e.stopPropagation();
    tip.addEventListener('mousedown', stop, true);
    return () => tip.removeEventListener('mousedown', stop, true);
  }, [feature]);

  // Reset when feature changes
  useEffect(() => {
    setStepIdx(0);
    setCompleted(false);
  }, [feature?.id]);

  const runCleanup = useCallback(() => {
    cleanupRef.current.forEach(fn => fn());
    cleanupRef.current = [];
  }, []);

  useEffect(() => runCleanup, [runCleanup]);

  // Escape key
  useEffect(() => {
    if (!feature) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); onEnd(); }
    };
    window.addEventListener('keydown', h, true);
    return () => window.removeEventListener('keydown', h, true);
  }, [feature, onEnd]);

  // Find target element from comma-separated selectors
  const findTarget = useCallback((selector: string): Element | null => {
    for (const sel of selector.split(',')) {
      const el = document.querySelector(sel.trim());
      if (el) return el;
    }
    return null;
  }, []);

  // Position highlight around element
  const updateHighlight = useCallback((el: Element | null, pad = 8) => {
    const hl = hlRef.current;
    if (!hl) return;
    if (!el) { hl.style.display = 'none'; return; }
    const r = el.getBoundingClientRect();
    hl.style.display = 'block';
    hl.style.left = (r.left - pad) + 'px';
    hl.style.top = (r.top - pad) + 'px';
    hl.style.width = (r.width + pad * 2) + 'px';
    hl.style.height = (r.height + pad * 2) + 'px';
  }, []);

  // Position tooltip next to element with arrow
  const updateTipPosition = useCallback((el: Element | null, preferredPos: string) => {
    const tip = tipRef.current;
    if (!tip) return;

    // Remove old arrow, create new
    tip.querySelector('.pd-arrow')?.remove();
    const arrow = document.createElement('div');
    arrow.className = 'pd-arrow';

    if (!el) {
      tip.style.left = '50%';
      tip.style.top = '40%';
      tip.style.transform = 'translate(-50%,-50%)';
      tip.appendChild(arrow);
      return;
    }
    tip.style.transform = 'none';

    const r = el.getBoundingClientRect();
    const tw = 300, th = tip.offsetHeight || 120, gap = 18, pad = 8;
    const vw = window.innerWidth, vh = window.innerHeight;

    const space: Record<string, number> = { top: r.top, bottom: vh - r.bottom, left: r.left, right: vw - r.right };
    const needed: Record<string, number> = { top: th + gap, bottom: th + gap, left: tw + gap, right: tw + gap };
    let pos = preferredPos;
    if (space[pos] < needed[pos]) {
      pos = Object.keys(space).reduce((a, b) => space[a] - needed[a] > space[b] - needed[b] ? a : b);
    }

    let tipLeft: number, tipTop: number, ao: number;
    if (pos === 'top') {
      tipLeft = Math.max(pad, Math.min(r.left + r.width / 2 - tw / 2, vw - tw - pad));
      tipTop = Math.max(pad, r.top - gap - th);
      ao = Math.max(12, Math.min(r.left + r.width / 2 - tipLeft, tw - 12));
      arrow.style.cssText = `bottom:-6px;left:${ao}px;margin-left:-6px`;
    } else if (pos === 'bottom') {
      tipLeft = Math.max(pad, Math.min(r.left + r.width / 2 - tw / 2, vw - tw - pad));
      tipTop = Math.min(vh - th - pad, r.bottom + gap);
      ao = Math.max(12, Math.min(r.left + r.width / 2 - tipLeft, tw - 12));
      arrow.style.cssText = `top:-6px;left:${ao}px;margin-left:-6px`;
    } else if (pos === 'left') {
      tipLeft = Math.max(pad, r.left - tw - gap);
      tipTop = Math.max(pad, Math.min(r.top + r.height / 2 - th / 2, vh - th - pad));
      ao = Math.max(12, Math.min(r.top + r.height / 2 - tipTop - 6, th - 12));
      arrow.style.cssText = `right:-6px;top:${ao}px`;
    } else {
      tipLeft = Math.min(vw - tw - pad, r.right + gap);
      tipTop = Math.max(pad, Math.min(r.top + r.height / 2 - th / 2, vh - th - pad));
      ao = Math.max(12, Math.min(r.top + r.height / 2 - tipTop - 6, th - 12));
      arrow.style.cssText = `left:-6px;top:${ao}px`;
    }
    tip.style.left = tipLeft + 'px';
    tip.style.top = tipTop + 'px';
    tip.appendChild(arrow);
  }, []);

  // Core step display logic
  useEffect(() => {
    if (!feature || completed) return;
    runCleanup();

    if (stepIdx >= feature.steps.length) {
      setCompleted(true);
      return;
    }

    const step = feature.steps[stepIdx];
    const total = feature.steps.length;
    if (step.setup) step.setup();

    // Poll for target element (may appear after animation)
    let pollCount = 0;
    const maxPoll = 60;

    const pollForTarget = () => {
      if (!featureRef.current) return;
      const el = findTarget(step.target);
      if (!el && pollCount < maxPoll) {
        pollCount++;
        const raf = requestAnimationFrame(pollForTarget);
        cleanupRef.current.push(() => cancelAnimationFrame(raf));
        return;
      }
      renderStep(el);
    };

    const renderStep = (targetEl: Element | null) => {
      updateHighlight(targetEl);

      if (targetEl) {
        const r = targetEl.getBoundingClientRect();
        if (r.top < 0 || r.bottom > window.innerHeight) {
          targetEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      }

      // Build tooltip
      const wt = step.wait || 'observe';
      const isWait = wt === 'click' || wt === 'validate' || (typeof wt === 'string' && wt.startsWith('appear:'));
      const isLast = stepIdx === total - 1;

      let dots = '<div class="pd-progress">';
      for (let i = 0; i < total; i++) {
        dots += `<div class="pd-dot${i < stepIdx ? ' done' : ''}${i === stepIdx ? ' current' : ''}"></div>`;
      }
      dots += '</div>';

      let waitHtml = '';
      if (wt === 'click') waitHtml = '<div class="pd-wait">Click the highlighted element to continue</div>';
      else if (wt === 'validate') waitHtml = '<div class="pd-wait">Complete the action to continue</div>';
      else if (typeof wt === 'string' && wt.startsWith('appear:')) waitHtml = '<div class="pd-wait">Waiting...</div>';

      const tip = tipRef.current;
      if (tip) {
        tip.innerHTML =
          dots +
          `<div class="pd-step"><span>Step ${stepIdx + 1} of ${total}</span><span class="pd-step-skip">skip tour</span></div>` +
          `<div class="pd-text">${step.text}</div>` +
          waitHtml +
          '<div class="pd-btns">' +
            (stepIdx > 0 ? '<button class="pd-b pd-b-sec pd-prev">Back</button>' : '') +
            (isWait ? '' : (isLast ? '<button class="pd-b pd-b-done pd-done">Done</button>' : '<button class="pd-b pd-b-pri pd-next">Next</button>')) +
          '</div>';

        updateTipPosition(targetEl, step.pos || 'bottom');

        // Wire buttons
        const nxt = tip.querySelector('.pd-next') as HTMLElement;
        const prv = tip.querySelector('.pd-prev') as HTMLElement;
        const dn = tip.querySelector('.pd-done') as HTMLElement;
        const sk = tip.querySelector('.pd-step-skip') as HTMLElement;
        if (nxt) nxt.onclick = () => setStepIdx(i => i + 1);
        if (prv) prv.onclick = () => setStepIdx(i => i - 1);
        if (dn) dn.onclick = () => setCompleted(true);
        if (sk) sk.onclick = onEnd;
      }

      // Track target position each frame (it may move if window resizes etc.)
      const track = () => {
        if (!featureRef.current) return;
        const el = findTarget(step.target);
        if (el) {
          updateHighlight(el);
          updateTipPosition(el, step.pos || 'bottom');
        }
        trackRafRef.current = requestAnimationFrame(track);
      };
      trackRafRef.current = requestAnimationFrame(track);
      cleanupRef.current.push(() => cancelAnimationFrame(trackRafRef.current));

      // Wait-type handlers
      if (wt === 'click' && targetEl) {
        const h = () => setStepIdx(i => i + 1);
        targetEl.addEventListener('click', h, { once: true });
        cleanupRef.current.push(() => targetEl.removeEventListener('click', h));
      } else if (wt === 'validate' && step.validate) {
        const iv = setInterval(() => {
          if (step.validate!()) { clearInterval(iv); setStepIdx(i => i + 1); }
        }, 300);
        cleanupRef.current.push(() => clearInterval(iv));
      } else if (typeof wt === 'string' && wt.startsWith('appear:')) {
        const sel = wt.slice(7);
        const iv = setInterval(() => {
          if (document.querySelector(sel)) { clearInterval(iv); setStepIdx(i => i + 1); }
        }, 300);
        cleanupRef.current.push(() => clearInterval(iv));
      }
    };

    const initRaf = requestAnimationFrame(pollForTarget);
    cleanupRef.current.push(() => cancelAnimationFrame(initRaf));

    return runCleanup;
  }, [feature, stepIdx, completed, runCleanup, findTarget, updateHighlight, updateTipPosition, onEnd]);

  // Completion screen
  useEffect(() => {
    if (!completed || !feature) return;
    runCleanup();
    updateHighlight(null);

    const tip = tipRef.current;
    if (!tip) return;

    const total = feature.steps.length;
    let dots = '<div class="pd-progress">';
    for (let i = 0; i < total; i++) dots += '<div class="pd-dot done"></div>';
    dots += '</div>';

    tip.innerHTML =
      dots +
      '<div class="pd-complete-icon">&#10003;</div>' +
      '<div class="pd-complete-title">Tutorial Complete</div>' +
      `<div class="pd-complete-desc">You've completed the <b>${feature.name}</b> tutorial.</div>` +
      '<div class="pd-btns" style="justify-content:center;flex-wrap:wrap">' +
        '<button class="pd-b pd-b-sec pd-restart">Show again</button>' +
        '<button class="pd-b pd-b-done pd-close">Done</button>' +
      '</div>';

    tip.style.left = '50%';
    tip.style.top = '40%';
    tip.style.transform = 'translate(-50%, -50%)';

    const restart = tip.querySelector('.pd-restart') as HTMLElement;
    const close = tip.querySelector('.pd-close') as HTMLElement;
    if (restart) restart.onclick = () => { setCompleted(false); setStepIdx(0); };
    if (close) close.onclick = onEnd;
  }, [completed, feature, runCleanup, updateHighlight, onEnd]);

  if (!feature) return null;

  return createPortal(
    <>
      <div ref={hlRef} className="pd-hl" style={{ display: 'none' }} />
      <div ref={tipRef} className="pd-tip" style={{ display: 'block' }} />
    </>,
    document.body
  );
}
