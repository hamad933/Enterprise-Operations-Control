const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const baseUrl = process.env.RP02_VISUAL_BASE_URL || 'http://127.0.0.1:4173';
const phase = process.env.RP02_VISUAL_PHASE || 'before';
const outputDir = process.env.RP02_VISUAL_OUTPUT || path.join(process.cwd(), 'visual-evidence');

const viewports = [
  { name: 'desktop', width: 1440, height: 960 },
  { name: 'tablet', width: 900, height: 1024 },
  { name: 'mobile', width: 390, height: 844 }
];

const surfaces = [
  { id: 's01', path: '/app/index.html', ready: '#attentionHeading' },
  { id: 's02', path: '/app/work-queue.html', ready: '#queueList' },
  { id: 's03', path: '/app/operations.html?surface=sites', ready: '#surfaceTitle' },
  { id: 's04', path: '/app/operations.html?surface=performance', ready: '#surfaceTitle' },
  { id: 's05', path: '/app/operations.html?surface=decisions', ready: '#surfaceTitle' },
  { id: 's06', path: '/app/operations.html?surface=reviews', ready: '#surfaceTitle' },
  { id: 's07', path: '/app/operations.html?surface=reports', ready: '#surfaceTitle' },
  { id: 's08', path: '/app/operations.html?surface=administration', ready: '#surfaceTitle' }
];

fs.mkdirSync(outputDir, { recursive: true });

function safeName(value) {
  return value.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
}

async function stabilize(page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addStyleTag({
    content: `
      *,*::before,*::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition: none !important;
        caret-color: transparent !important;
        scroll-behavior: auto !important;
      }
    `
  });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
    window.scrollTo(0, 0);
  });
}

async function capturePage(browser, viewport, target, fileName, { fullPage = true } = {}) {
  const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1 });
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto(`${baseUrl}${target.path}`, { waitUntil: 'networkidle' });
  if (target.ready) await page.locator(target.ready).waitFor({ state: 'visible' });
  await stabilize(page);

  const metrics = await page.evaluate(() => ({
    lang: document.documentElement.lang,
    dir: document.documentElement.dir,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    height: document.documentElement.scrollHeight
  }));

  assert.equal(metrics.lang, 'ar', `${fileName}: expected lang=ar`);
  assert.equal(metrics.dir, 'rtl', `${fileName}: expected dir=rtl`);
  assert.ok(metrics.scrollWidth <= metrics.clientWidth + 1, `${fileName}: horizontal overflow ${metrics.scrollWidth} > ${metrics.clientWidth}`);
  assert.deepEqual(consoleErrors, [], `${fileName}: console errors: ${consoleErrors.join(' | ')}`);
  assert.deepEqual(pageErrors, [], `${fileName}: page errors: ${pageErrors.join(' | ')}`);

  await page.screenshot({ path: path.join(outputDir, fileName), fullPage });
  console.log(`[VISUAL_CAPTURE] ${fileName} ${viewport.width}x${viewport.height} pageHeight=${metrics.height}`);
  return page;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const viewport of viewports) {
      const referencePage = await capturePage(
        browser,
        viewport,
        { path: '/prototypes/rp02-s01/index.html', ready: 'body' },
        `reference-s01-${viewport.name}.png`
      );
      await referencePage.close();

      for (const surface of surfaces) {
        const page = await capturePage(
          browser,
          viewport,
          surface,
          `current-${surface.id}-${viewport.name}-${safeName(phase)}.png`
        );

        if (surface.id === 's01') {
          const route = page.locator('.route-panel');
          if (await route.count()) {
            await route.screenshot({ path: path.join(outputDir, `current-s01-route-ribbon-${viewport.name}-${safeName(phase)}.png`) });
          }
        }

        if (surface.id === 's02') {
          const focus = page.locator('#focusTask');
          if (await focus.count()) {
            await focus.screenshot({ path: path.join(outputDir, `current-s02-focus-task-${viewport.name}-${safeName(phase)}.png`) });
          }
        }

        if (surface.id === 's05') {
          const authority = page.locator('#decisionAuthority');
          if (await authority.count()) {
            await authority.screenshot({ path: path.join(outputDir, `current-s05-authority-${viewport.name}-${safeName(phase)}.png`) });
          }
        }

        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error('[VISUAL_CAPTURE] FAILURE', error);
  process.exitCode = 1;
});
