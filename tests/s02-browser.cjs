const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const baseUrl = process.env.S02_BASE_URL || 'http://127.0.0.1:4173/app';
const consoleErrors = [];
const pageErrors = [];
const results = [];

function record(name, detail = 'OK') {
  results.push({ name, detail });
  console.log(`[S02_BROWSER] ${name}: ${detail}`);
}

function attachRuntimeEvidence(page, label) {
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(`${label}: ${message.text()}`);
  });
  page.on('pageerror', (error) => pageErrors.push(`${label}: ${error.message}`));
}

async function gotoS02(page) {
  await page.goto(`${baseUrl}/work-queue.html`, { waitUntil: 'networkidle' });
  await page.locator('#queueList').waitFor({ state: 'visible' });
  await page.waitForFunction(() => document.documentElement.dataset.portfolioReady === 'true');
  await page.waitForTimeout(60);
}

async function selectTask(page, taskId) {
  const row = page.locator(`[data-task="${taskId}"]`);
  await row.click();
  await page.waitForTimeout(60);
  assert.equal(await row.getAttribute('aria-pressed'), 'true', `${taskId} must become the exact selected task`);
  assert.match(await page.locator('#focusTaskId').innerText(), new RegExp(taskId));
}

async function setActionSite(page, siteId) {
  await page.locator('#actionSiteSelect').selectOption(siteId);
  await page.waitForTimeout(60);
  assert.equal(await page.locator('#actionSiteSelect').inputValue(), siteId);
}

async function visibleTaskIds(page) {
  return page.locator('#queueList [data-task]').evaluateAll((rows) => rows.map((row) => row.dataset.task));
}

async function testCoreJourneys(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  attachRuntimeEvidence(page, 'core');

  await page.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('#attentionHeading').innerText(), 'أولويات الانتباه');
  record('S01 loads');

  const workNav = page.locator('.top-nav a[href$="work-queue.html"]').first();
  await workNav.click();
  await page.waitForURL(/work-queue\.html$/);
  await page.locator('#queueList').waitFor({ state: 'visible' });
  await page.waitForFunction(() => document.documentElement.dataset.portfolioReady === 'true');
  record('S01 → S02 navigation');

  assert.equal(await page.locator('html').getAttribute('lang'), 'ar');
  assert.equal(await page.locator('html').getAttribute('dir'), 'rtl');
  assert.match(await page.locator('h1#queueHeading').innerText(), /قائمة الأعمال/);
  assert.match(await page.locator('.brand').innerText(), /مدار المرافق/);
  record('S02 loads');

  await page.locator('#queueSearch').fill('PT-19/20');
  assert.deepEqual(await visibleTaskIds(page), ['TSK-2059']);
  await page.locator('#queueSearch').fill('');
  record('Queue search');

  await page.locator('[data-filter="evidence"]').click();
  assert.deepEqual(await visibleTaskIds(page), ['TSK-2052']);
  await page.locator('[data-filter="all"]').click();
  record('Queue filters');

  await selectTask(page, 'TSK-2048');
  record('Exact task selection');

  await setActionSite(page, 'ops');
  const explicitAperture = await page.locator('#focusAuthority').innerText();
  assert.match(explicitAperture, /غير مصرّح/);
  assert.match(explicitAperture, /رفض صلاحية صريح/);
  assert.doesNotMatch(explicitAperture, /لا يطابق موقع المهمة/);
  assert.match(await page.locator('#focusPrimaryAction').innerText(), /رفض صلاحية صريح/);
  assert.equal(await page.locator('#focusPrimaryAction').isDisabled(), true);
  record('Explicit authority-denied presentation with matching site');

  await selectTask(page, 'TSK-2041');
  const mismatchAperture = await page.locator('#focusAuthority').innerText();
  assert.match(mismatchAperture, /غير مصرّح/);
  assert.match(mismatchAperture, /لا يطابق موقع المهمة/);
  assert.match(await page.locator('#focusPrimaryAction').innerText(), /موقع الإجراء لا يطابق المهمة/);
  assert.equal(await page.locator('#focusPrimaryAction').isDisabled(), true);
  record('Site-mismatch denied path');

  await setActionSite(page, 'hq');
  assert.match(await page.locator('#focusAuthority').innerText(), /مصرّح/);
  assert.equal(await page.locator('#focusPrimaryAction').isDisabled(), false);
  record('Authorized matching-site path');

  await page.locator('#focusPrimaryAction').click();
  await page.waitForTimeout(60);
  assert.match(await page.locator('#focusClosure').innerText(), /تم إرسال طلب الإغلاق — ليس إغلاقًا نهائيًا/);
  assert.match(await page.locator('#focusClosure').innerText(), /بانتظار تحقق مستقل/);
  assert.equal(await page.locator('#focusPrimaryAction').isDisabled(), true);
  record('Closure request distinct from final closure');

  await selectTask(page, 'TSK-2052');
  assert.match(await page.locator('#focusEvidence').innerText(), /الدليل غير مكتمل/);
  assert.match(await page.locator('#focusActionCode').innerText(), /الدليل غير مكتمل/);
  assert.equal(await page.locator('#focusPrimaryAction').isDisabled(), true);
  record('Missing evidence remains unresolved');

  await selectTask(page, 'TSK-2063');
  assert.match(await page.locator('#focusActionCode').innerText(), /بانتظار القرار/);
  assert.equal(await page.locator('#focusPrimaryAction').isDisabled(), true);
  record('Decision restriction');

  await setActionSite(page, 'pump');
  await selectTask(page, 'TSK-2059');
  assert.match(await page.locator('#focusClosure').innerText(), /مرفوض في التحقق/);
  assert.match(await page.locator('#focusPrimaryAction').innerText(), /بدء إعادة العمل/);
  await page.locator('#focusPrimaryAction').click();
  await page.waitForTimeout(60);
  assert.match(await page.locator('#focusClosure').innerText(), /إعادة العمل نشطة/);
  assert.match(await page.locator('#focusEvidence').innerText(), /يلزم تحديث الدليل/);
  assert.match(await page.locator('#focusEvidence').innerText(), /الدليل السابق محفوظ تاريخيًا/);
  assert.match(await page.locator('#focusActionCode').innerText(), /إعادة العمل جارية/);
  assert.equal(await page.locator('#focusPrimaryAction').isDisabled(), true);
  assert.match(await page.locator('#focusActionNote').innerText(), /الدليل السابق محفوظ كسجل تاريخي/);
  assert.match(await page.locator('#focusHistory').innerText(), /مرفوض في التحقق/);
  assert.match(await page.locator('#focusHistory').innerText(), /بدأت إعادة العمل/);
  assert.match(await page.locator('#focusHistory').innerText(), /RW-02/);
  record('Rejected verification → active rework');
  record('Active rework cannot immediately request closure');

  assert.ok(await page.locator('bdi[dir="ltr"]').filter({ hasText: 'TSK-2059' }).count() > 0);
  record('RTL/LTR technical identifiers');

  await page.close();
}

async function testResponsive(browser, width, height, label) {
  const page = await browser.newPage({ viewport: { width, height } });
  attachRuntimeEvidence(page, label);
  await gotoS02(page);

  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    layoutDisplay: getComputedStyle(document.querySelector('.s02-layout')).display,
    layoutColumns: getComputedStyle(document.querySelector('.s02-layout')).gridTemplateColumns,
    mobileBar: getComputedStyle(document.querySelector('.mobile-bar')).display,
    queueHead: getComputedStyle(document.querySelector('.queue-head')).display
  }));
  assert.ok(metrics.scrollWidth <= metrics.clientWidth + 1, `${label} horizontal overflow: ${metrics.scrollWidth} > ${metrics.clientWidth}`);

  if (label === 'desktop') {
    assert.equal(metrics.layoutDisplay, 'grid');
    const boxes = await page.evaluate(() => {
      const queue = document.querySelector('.queue-column').getBoundingClientRect();
      const focus = document.querySelector('.focus-task').getBoundingClientRect();
      return { queueWidth: queue.width, focusWidth: focus.width, queueTop: queue.top, focusTop: focus.top };
    });
    assert.ok(boxes.queueWidth > boxes.focusWidth);
    assert.ok(boxes.focusWidth >= 350);
  } else if (label === 'tablet') {
    assert.equal(metrics.layoutDisplay, 'grid');
    assert.equal(metrics.layoutColumns.split(' ').length, 1);
  } else if (label === 'mobile') {
    assert.equal(metrics.layoutDisplay, 'flex');
    assert.equal(metrics.mobileBar, 'grid');
    assert.equal(metrics.queueHead, 'none');
    const mobileOrder = await page.evaluate(() => {
      const queue = document.querySelector('.queue-column').getBoundingClientRect();
      const focus = document.querySelector('.focus-task').getBoundingClientRect();
      return { focusTop: focus.top, queueTop: queue.top };
    });
    assert.ok(mobileOrder.focusTop < mobileOrder.queueTop, 'mobile Focus Task must appear before the queue');
  }

  record(`${label} layout`, `${width}x${height}, no horizontal overflow`);
  await page.close();
}

async function testKeyboardAndNames(browser) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  attachRuntimeEvidence(page, 'keyboard');
  await gotoS02(page);

  let reachedSearch = false;
  for (let i = 0; i < 20; i += 1) {
    await page.keyboard.press('Tab');
    const activeId = await page.evaluate(() => document.activeElement?.id || '');
    if (activeId === 'queueSearch') {
      reachedSearch = true;
      break;
    }
  }
  assert.equal(reachedSearch, true, 'queue search must be reachable by keyboard-only navigation');

  const focusStyle = await page.locator('#queueSearch').evaluate((element) => {
    const style = getComputedStyle(element);
    return { outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth };
  });
  assert.notEqual(focusStyle.outlineStyle, 'none');
  assert.notEqual(focusStyle.outlineWidth, '0px');
  record('Keyboard-only navigation');
  record('Visible focus');

  const names = await page.evaluate(() => {
    const search = document.querySelector('#queueSearch');
    const site = document.querySelector('#actionSiteSelect');
    const primary = document.querySelector('#focusPrimaryAction');
    return {
      search: search.labels?.[0]?.innerText.trim() || search.getAttribute('aria-label') || '',
      site: site.labels?.[0]?.innerText.trim() || site.getAttribute('aria-label') || '',
      primary: primary.getAttribute('aria-label') || primary.innerText.trim()
    };
  });
  assert.ok(names.search.length > 0);
  assert.ok(names.site.length > 0);
  assert.ok(names.primary.length > 0);
  record('Accessible names');

  await page.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    await testCoreJourneys(browser);
    await testResponsive(browser, 1440, 960, 'desktop');
    await testResponsive(browser, 900, 1024, 'tablet');
    await testResponsive(browser, 390, 844, 'mobile');
    await testKeyboardAndNames(browser);

    assert.deepEqual(consoleErrors, [], `Application console errors:\n${consoleErrors.join('\n')}`);
    assert.deepEqual(pageErrors, [], `Application page errors:\n${pageErrors.join('\n')}`);
    record('Application console errors', 'NONE');
    record('Application page errors', 'NONE');

    console.log(`[S02_BROWSER] SUMMARY ${JSON.stringify(results)}`);
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error('[S02_BROWSER] FAILURE', error);
  process.exitCode = 1;
});
