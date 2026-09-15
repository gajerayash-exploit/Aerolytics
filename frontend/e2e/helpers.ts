import { type Page, type BrowserContext, expect } from '@playwright/test';

export const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const PUBLIC_ROUTES = [
  '/', '/login', '/request-access', '/forgot-password', '/demo', '/platform',
  '/solutions/energy', '/solutions/agri', '/solutions/rescue', '/about', '/contact', '/status',
];

export const APP_ROUTES = [
  '/dashboard', '/missions', '/missions/new', '/missions/AER-EN-0142', '/missions/AER-AG-0057/report',
  '/missions/AER-RS-0019/frames', '/missions/AER-EN-0142/detections/DET-0142-01', '/live', '/analytics',
  '/sites', '/sites/rsp', '/fleet', '/fleet/QUAD-02', '/mission-planner', '/reports',
  '/settings/profile', '/settings/organization', '/settings/team', '/settings/api-keys', '/settings/models', '/audit-log',
];

export async function signIn(context: BrowserContext, baseURL: string) {
  await context.addCookies([{ name: 'aero_session', value: 'e2e', url: baseURL }]);
}

/** Collects uncaught page errors and console errors (ignores dev-only noise). */
export function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (/Download the React DevTools|\[HMR\]|favicon|net::ERR_CONNECTION_REFUSED|Failed to load resource/.test(t)) return;
    errors.push('console: ' + t);
  });
  return errors;
}

export async function waitForView(page: Page) {
  await expect(page.locator('.view-loading')).toHaveCount(0);
  await page.waitForTimeout(400); // let the first animation frame and layout settle
}

/**
 * Finds interactive controls whose visible area is covered by another element.
 * For each visible link/button/input it samples the centre and four inset points;
 * a point passes when document.elementFromPoint lands on the control, inside it, or on its <label>.
 * A control fails only when the majority of its sample points are covered.
 */
export async function findCoveredControls(page: Page) {
  return page.evaluate(async () => {
    const sel = 'a[href], button, input:not([type=hidden]):not(.hidden-file), select, textarea, [role=button], [role=tab]';
    const out: { control: string; coveredBy: string; rect: number[] }[] = [];
    const describe = (el: Element | null) => {
      if (!el) return 'nothing';
      const h = el as HTMLElement;
      const cls = typeof h.className === 'string' ? '.' + h.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
      const txt = (h.innerText || h.getAttribute('aria-label') || h.getAttribute('placeholder') || '').trim().replace(/\s+/g, ' ').slice(0, 40);
      return `${el.tagName.toLowerCase()}${cls !== '.' ? cls : ''}${txt ? ` "${txt}"` : ''}`;
    };
    const els = Array.from(document.querySelectorAll(sel)) as HTMLElement[];
    for (const el of els) {
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || cs.pointerEvents === 'none' || Number(cs.opacity) === 0) continue;
      if (el.closest('[aria-hidden="true"]')) continue;
      el.scrollIntoView({ block: 'center', inline: 'center' });
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) continue;
      // skip controls clipped away by an overflow container (not an overlay problem)
      const vw = innerWidth, vh = innerHeight;
      if (r.right <= 0 || r.bottom <= 0 || r.left >= vw || r.top >= vh) continue;
      const pts = [[0.5, 0.5], [0.25, 0.3], [0.75, 0.3], [0.25, 0.7], [0.75, 0.7]].map(([fx, fy]) => [
        Math.min(vw - 1, Math.max(0, r.left + r.width * fx)), Math.min(vh - 1, Math.max(0, r.top + r.height * fy)),
      ]);
      let covered = 0; let blocker: Element | null = null;
      for (const [x, y] of pts) {
        const hit = document.elementFromPoint(x, y);
        // an ancestor at the point means the control is clipped inside a scroll area, not covered by another element
        const ok = hit && (hit === el || hit.contains(el) || hit.tagName === 'NEXTJS-PORTAL' || el.contains(hit) || (hit as HTMLElement).closest?.('label')?.contains(el) || (el.id && hit.closest?.(`label[for="${el.id}"]`)));
        if (!ok) { covered++; blocker = hit; }
      }
      if (covered >= 3) out.push({ control: describe(el), coveredBy: describe(blocker), rect: [r.left, r.top, r.width, r.height].map(Math.round) });
    }
    window.scrollTo(0, 0);
    return out;
  });
}
