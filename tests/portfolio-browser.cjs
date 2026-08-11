const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const baseUrl = process.env.RP02_PORTFOLIO_BASE_URL || 'http://127.0.0.1:4173';
const viewports = [
  ['desktop', 1440, 960],
  ['compact-desktop', 1024, 768],
  ['tablet', 900, 1024],
  ['mobile-wide', 430, 932],
  ['mobile', 390, 844],
  ['mobile-compact', 360, 800]
];
const surfaces = [
  ['attention', '/app/index.html', '#attentionHeading'],
  ['work', '/app/work-queue.html', '#queueList'],
  ['sites', '/app/operations.html?surface=sites', '#surfaceTitle'],
  ['performance', '/app/operations.html?surface=performance', '#surfaceTitle'],
  ['decisions', '/app/operations.html?surface=decisions', '#surfaceTitle'],
  ['reviews', '/app/operations.html?surface=reviews', '#surfaceTitle'],
  ['reports', '/app/operations.html?surface=reports', '#surfaceTitle'],
  ['administration', '/app/operations.html?surface=administration', '#surfaceTitle']
];

function scrubLegitimateOperationalCodes(text) {
  return text
    .replaceAll('VALIDATION_REQUIRED', 'OPERATIONAL_STATE')
    .replaceAll('OUT_OF_SCOPE', 'OPERATIONAL_STATE')
    .replaceAll('TEST', 'OPERATIONAL_STATE');
}

function assertNoDevelopmentLeakage(text, context) {
  const scrubbed = scrubLegitimateOperationalCodes(text);
  const forbidden = [
    /\bRP02\b/i,
    /\bS0[1-8]\b/i,
    /\bprototype\b/i,
    /\bworkstream\b/i,
    /\bplaceholder\b/i,
    /\bvalidation\b/i,
    /\bbuild\b/i,
    /\btest\b/i,
    /out of scope/i,
    /\bbackend\b/i,
    /\bAPI\b/,
    /\bPDF\b/,
    /اصطناعي(?:ة|ًا)?/,
    /محاكاة/
  ];
  for (const pattern of forbidden) {
    assert.equal(pattern.test(scrubbed), false, `${context}: visible development leakage matched ${pattern}`);
  }
}

async function openChecked(browser, surface, viewport) {
  const [surfaceName, target, ready] = surface;
  const [viewportName, width, height] = viewport;
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto(`${baseUrl}${target}`, { waitUntil: 'networkidle' });
  await page.locator(ready).waitFor({ state: 'visible' });
  await page.waitForFunction(() => document.documentElement.dataset.portfolioReady === 'true');
  await page.waitForTimeout(60);

  const result = await page.evaluate(() => {
    const root = document.documentElement;
    const bodyText = document.body.innerText;
    const unnamed = [...document.querySelectorAll('button,a[href],input,select')]
      .filter((node) => {
        const style = getComputedStyle(node);
        return style.display !== 'none' && style.visibility !== 'hidden' && node.getClientRects().length > 0;
      })
      .filter((node) => {
        const aria = node.getAttribute('aria-label')?.trim();
        const title = node.getAttribute('title')?.trim();
        const text = node.innerText?.trim();
        const placeholder = node.getAttribute('placeholder')?.trim();
        const labelled = node.getAttribute('aria-labelledby')?.trim();
        const label = node.labels?.[0]?.innerText?.trim();
        return !(aria || title || text || placeholder || labelled || label);
      })
      .map((node) => `${node.tagName.toLowerCase()}#${node.id || ''}.${node.className || ''}`);
    const ids = [...document.querySelectorAll('bdi[dir="ltr"],.ltr')].slice(0, 30).map((node) => ({
      text: node.textContent.trim(),
      direction: getComputedStyle(node).direction
    }));
    return {
      title: document.title,
      bodyText,
      lang: root.lang,
      dir: root.dir,
      scrollWidth: root.scrollWidth,
      clientWidth: root.clientWidth,
      unnamed,
      ids
    };
  });

  assert.equal(result.lang, 'ar', `${surfaceName}/${viewportName}: lang`);
  assert.equal(result.dir, 'rtl', `${surfaceName}/${viewportName}: dir`);
  assert.ok(result.scrollWidth <= result.clientWidth + 1, `${surfaceName}/${viewportName}: horizontal overflow ${result.scrollWidth} > ${result.clientWidth}`);
  assert.deepEqual(consoleErrors, [], `${surfaceName}/${viewportName}: console errors ${consoleErrors.join(' | ')}`);
  assert.deepEqual(pageErrors, [], `${surfaceName}/${viewportName}: page errors ${pageErrors.join(' | ')}`);
  assert.deepEqual(result.unnamed, [], `${surfaceName}/${viewportName}: unnamed controls ${result.unnamed.join(', ')}`);
  assertNoDevelopmentLeakage(`${result.title}\n${result.bodyText}`, `${surfaceName}/${viewportName}`);
  assert.ok(result.ids.every((item) => item.direction === 'ltr'), `${surfaceName}/${viewportName}: technical identifier direction corrupted`);

  if (width <= 430) {
    const mobileTargets = await page.evaluate(() => [...document.querySelectorAll('.mobile-bar a,.completion-mobile-nav a,.primary-action:not([disabled])')]
      .filter((node) => node.getClientRects().length > 0)
      .map((node) => ({ text: node.textContent.trim(), width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height })));
    for (const target of mobileTargets) {
      assert.ok(target.height >= 40, `${surfaceName}/${viewportName}: touch target too short: ${target.text} (${target.height}px)`);
      assert.ok(target.width >= 40, `${surfaceName}/${viewportName}: touch target too narrow: ${target.text} (${target.width}px)`);
    }
  }

  return page;
}

async function checkKeyboardFocus(page, label) {
  await page.keyboard.press('Tab');
  const focus = await page.evaluate(() => {
    const node = document.activeElement;
    const style = getComputedStyle(node);
    return { tag: node?.tagName, outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth };
  });
  assert.notEqual(focus.tag, 'BODY', `${label}: keyboard focus remained on body`);
  assert.notEqual(focus.outlineStyle, 'none', `${label}: focus indicator missing`);
  assert.notEqual(focus.outlineWidth, '0px', `${label}: focus indicator width is zero`);
}

async function semanticJourneys(browser) {
  const viewport = ['desktop', 1440, 960];

  let page = await openChecked(browser, surfaces[0], viewport);
  const firstRow = page.locator('.ledger-row').first();
  await firstRow.focus();
  await page.keyboard.press('Enter');
  await page.locator('#focusPanel.open').waitFor();
  assert.equal(await page.locator('#focusPanel').getAttribute('aria-modal'), 'true');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.getElementById('focusPanel').classList.contains('open'));
  assert.equal(await firstRow.evaluate((node) => document.activeElement === node), true, 'S01: focus restoration failed');
  await page.close();

  page = await openChecked(browser, surfaces[1], viewport);
  await page.locator('[data-task="TSK-2052"]').click();
  assert.equal(await page.locator('#focusPrimaryAction').isDisabled(), true, 'S02: missing evidence must block closure');
  await page.locator('[data-task="TSK-2041"]').click();
  assert.equal(await page.locator('#focusPrimaryAction').isEnabled(), true, 'S02: authorized closure request should be enabled');
  await page.locator('#focusPrimaryAction').click();
  await page.waitForTimeout(80);
  assert.match(await page.locator('#focusClosure').innerText(), /بانتظار|التحقق/);
  await page.close();

  page = await openChecked(browser, surfaces[3], viewport);
  const validate = page.locator('[data-action="validate-kpi"]');
  assert.equal(await validate.isEnabled(), true, 'S04: KPI validation action should be enabled for selected deviation');
  await validate.click();
  await page.waitForTimeout(80);
  assert.match(await page.locator('body').innerText(), /تم تثبيت التحقق|VALIDATED/);
  await page.close();

  page = await openChecked(browser, surfaces[4], viewport);
  await page.locator('[data-deviation="DEV-118"]').click();
  assert.equal(await page.locator('[data-action="decide"]').isDisabled(), true, 'S05: denied authority must block decision');
  await page.locator('[data-deviation="DEV-203"]').click();
  assert.equal(await page.locator('[data-action="decide"]').isEnabled(), true, 'S05: authorized decision should be enabled');
  await page.locator('[data-action="decide"]').click();
  await page.waitForTimeout(80);
  assert.match(await page.locator('body').innerText(), /DECIDED|تم تسجيل القرار/);
  await page.close();

  page = await openChecked(browser, surfaces[5], viewport);
  await page.locator('[data-review="REV-812"]').click();
  assert.equal(await page.locator('[data-action="approve-review"]').isDisabled(), true, 'S06: rejected/out-of-scope review must block approval');
  await page.locator('[data-review="REV-884"]').click();
  assert.equal(await page.locator('[data-action="approve-review"]').isEnabled(), true, 'S06: authorized approval should be enabled');
  await page.close();

  page = await openChecked(browser, surfaces[7], viewport);
  await page.locator('[data-profile="USR-099"]').click();
  await page.locator('[data-action="check-access"]').click();
  await page.waitForTimeout(80);
  assert.match(await page.locator('#accessCheckResult').innerText(), /AUTHORITY_DENIED/);
  await page.close();
}

async function stateSurfaces(browser) {
  for (const mode of ['loading','empty','partial','error','readonly']) {
    const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`${baseUrl}/app/operations.html?surface=performance&state=${mode}`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.documentElement.dataset.portfolioReady === 'true');
    const text = await page.locator('body').innerText();
    assertNoDevelopmentLeakage(`${await page.title()}\n${text}`, `state/${mode}`);
    assert.deepEqual(errors, [], `state/${mode}: page errors`);
    await page.close();
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const viewport of viewports) {
      for (const target of surfaces) {
        const page = await openChecked(browser, target, viewport);
        if (viewport[0] === 'desktop') await checkKeyboardFocus(page, target[0]);
        await page.close();
      }
    }
    await semanticJourneys(browser);
    await stateSurfaces(browser);
    console.log('RP02 portfolio browser audit: PASS');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error('RP02 portfolio browser audit: FAIL', error);
  process.exitCode = 1;
});
